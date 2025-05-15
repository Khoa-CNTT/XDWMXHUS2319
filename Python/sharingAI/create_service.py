import asyncio
from datetime import datetime, timedelta
import decimal
import json
import logging
import random
import re
from typing import AsyncIterator, Dict, List, Optional
import uuid
from fastapi import logger
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
import psutil
from redis import Redis
from Promft import TablePromptGenerator
from config import NETCORE_API_URL
from config import GOOGLE_API_KEY_QUERY, GOOGLE_API_KEY_LLM, GOOGLE_API_KEY_SQL
from langchain.prompts import PromptTemplate
from answer_generator import AnswerGenerator
import time as time_module
from redis.asyncio import Redis
from data_loader import DataLoader

logger = logging.getLogger(__name__)


class CreateQueryProcessor:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY_LLM,
            temperature=0.5,
            max_output_tokens=2024,
            disable_streaming=False,
        )
        self.sql_llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY_SQL,
            temperature=0,
            max_output_tokens=2024,
            disable_streaming=True,
        )
        self.determine_llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY_QUERY,
            temperature=1,
            max_output_tokens=2024,
            disable_streaming=True,
        )
        self.base_url = NETCORE_API_URL
        self.http_client = httpx.AsyncClient()
        self.ans = AnswerGenerator()
        self.data_loader = DataLoader()
        self.table_prompt_generator = TablePromptGenerator()
        self.redis = Redis.from_url("redis://localhost:6379", decode_responses=True)

    def default_encoder(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        elif isinstance(obj, (datetime,)):
            return obj.isoformat()
        elif isinstance(obj, uuid.UUID):
            return str(obj)
        elif isinstance(obj, bytes):
            return obj.decode("utf-8", errors="replace")
        elif isinstance(obj, set):
            return list(obj)
        elif hasattr(obj, "__str__"):
            return str(obj)
        raise TypeError(
            f"Object of type {obj.__class__.__name__} is not JSON serializable"
        )

    async def _Determine_endpoint_create_async(
        self, query: str, chat_history: List[Dict], sql_result: List[Dict]
    ) -> Dict:
        logger.debug(f"Preprocessing query: {query}")

        def normalize_params(params):
            """
            Chuyển đổi params từ mảng các { param, value } hoặc mảng chứa object
            thành một object { key: value }.
            """
            if not params:
                return {}

            # Trường hợp params là mảng chứa một object
            if (
                isinstance(params, list)
                and len(params) == 1
                and isinstance(params[0], dict)
            ):
                result = {}
                for key, value in params[0].items():
                    result[key] = None if value == "null" else value
                return result

            # Trường hợp params là mảng các { param, value }
            if isinstance(params, list):
                result = {}
                for item in params:
                    if isinstance(item, dict) and "param" in item and "value" in item:
                        result[item["param"]] = (
                            None if item["value"] == "null" else item["value"]
                        )
                return result

            # Trường hợp params đã là object
            if isinstance(params, dict):
                result = {}
                for key, value in params.items():
                    result[key] = None if value == "null" else value
                return result

            # Trường hợp không xác định
            logger.warning(f"Không thể chuẩn hóa params: {params}")
            return {}
            return v

        preprocess_prompt = PromptTemplate(
            input_variables=["query", "chat_history", "base_url", "sql_result"],
            template="""
            Bạn là trợ lý AI thông minh, có nhiệm vụ phân tích câu hỏi của người dùng để xác định:
            1. **Thông tin tham số**: Các giá trị cụ thể mà người dùng cung cấp để điền vào tham số của endpoint (như nội dung bài đăng, phạm vi bài đăng, ID người dùng, v.v.).
            2. **Thông tin truy vấn**: Phần câu hỏi yêu cầu truy vấn cơ sở dữ liệu (như "bài đăng mới nhất", "bạn bè của tôi", "bình luận trên bài đăng X").
            
            ---
            ### Current Query:
            {query}

            ### Ngữ cảnh trước đó:
            {chat_history}
            ### Kết quả của lần truy vấn trước đó:
            {sql_result}
            **Hướng dẫn phân tích lịch sử chat**:
            - **Ngữ cảnh gần nhất**: Nếu trong `chat_history`, có câu trả lời gần nhất từ trợ lý (role: "assistant") chứa câu hỏi yêu cầu bổ sung thông tin (như "Bạn muốn viết gì?","Bạn muốn ai có thể nhìn thấy bài đăng này? (Mọi người, chỉ bạn bè, hoặc riêng tư?)"), hãy ưu tiên liên kết {{query}} mới với câu hỏi đó.
            - **Tham số còn thiếu**: Kiểm tra {{missing_fields}} trong mục `"context"` của câu trả lời gần nhất (nếu có). Nếu query mới là một chuỗi văn bản đơn giản (không chứa hành động như "bình luận", "đăng bài") và {{missing_fields}} chứa một tham số như `Content`, hãy gán query mới vào tham số đó.
            - **Xử lý tham số boolean (`IsSafetyTrackingEnabled`)**:
            - Nếu `missing_fields` chứa `IsSafetyTrackingEnabled` và câu hỏi gần nhất từ trợ lý có dạng hỏi có/không (như "Bạn có muốn bật tính năng theo dõi an toàn không?"), hãy ánh xạ câu trả lời của người dùng như sau:
                - Các từ như "có", "được", "ok", "bật", "muốn" (không phân biệt hoa thường) ánh xạ thành `IsSafetyTrackingEnabled: true`.
                - Các từ như "không", "không muốn", "tắt" (không phân biệt hoa thường) ánh xạ thành `IsSafetyTrackingEnabled: false`.
                - Nếu query không khớp với các từ trên, giữ nguyên `IsSafetyTrackingEnabled: null` và để trong `missing_fields`.
            - **Tham số đã cung cấp**: Sử dụng {{params}} trong mục `"context"` của câu trả lời gần nhất để giữ lại các giá trị đã xác định (như `PostId`, `Scope`).
            - **Endpoint trước đó**: Nếu {{endpoint}} đã được xác định trong lịch sử chat, ưu tiên giữ nguyên trừ khi query mới rõ ràng yêu cầu một hành động khác.
            - **Các {{Endpoint}} trước đó chính là hành động mà người dùng đang muốn thực hiện, không được tự ý thay đổi {{Endpoint}}.
            - Nếu query mới không liên quan đến ngữ cảnh trước đó hoặc không chứa hành động rõ ràng, hãy coi nó như một yêu cầu độc lập và phân tích lại từ đầu.
            --Các Endpoint của BE liên quan đến tạo mới kèm tham số cần thiết:
            - EndPoint liên quan đến đăng bài như mạng xã hôi:
            -{base_url}/api/Post/create
            Giải thích: Endpoint này dùng để tạo mới 1 bài đăng như mạng xã hôi.
            Các tham số cần thiết từ BE(params):
            "Content":không được phép null
            "Images":được phép null
            "Video":được phép null
            "Scope":không được phép null
            - EndPoint liên quan đến bình luận 1 bài đăng như mạng xã hôi:
            -{base_url}/api/Comment/CommentPost
            Giải thích: Endpoint này dùng để tạo mới 1 bình luận trong 1 bài đăng như mạng xã hôi.
            Các tham số cần thiết từ BE(params):
            "PostId":không được phép null
            "Content":không được phép null
            - EndPoint liên quan đến trả lời 1 bình luận trong 1 bài đăng như mạng xã hôi:
            -{base_url}/api/Comment/ReplyComment
            Giải thích: Endpoint này dùng để tạo mới 1 bình luận trong 1 bình luận như mạng xã hôi (Reply).
            Các tham số cần thiết từ BE(params):
            "PostId":không được phép null
            "ParentCommentId":không được phép null
            "Content":không được phép null
            - EndPoint liên quan đến thích 1 bài đăng như mạng xã hôi:
            -{base_url}/api/Like/like
            Giải thích: Endpoint này dùng để tạo mới 1 thích trong 1 bài đăng như mạng xã hôi (Like).
            Các tham số cần thiết từ BE(params):
            "PostId":không được phép null
            - EndPoint liên quan đến thích 1 bình luận trong 1 bài đăng như mạng xã hôi:
            -{base_url}/api/CommentLike/like/{{id}}
            Giải thích: Endpoint này dùng để tạo mới 1 lược thích cho 1 bình luận như mạng xã hôi.
            Các tham số cần thiết từ BE(params):
            "CommentId":không được phép null
            - EndPoint liên quan đến gửi lời mời kết bạn như mạng xã hôi:
            -{base_url}/api/FriendShip/send-friend-request
            Giải thích: Endpoint này dùng để tạo mới 1 bảng ghi trong Database với yêu cầu gửi 1 lời mời kết bạn đến ai đó như facebook.
            Các tham số cần thiết từ BE(params):
            "FriendId":không được phép null
            - EndPoint liên quan đến chia sẽ môt bài đăng nào đó như mạng xã hôi:
            -{base_url}/api/Share/SharePost
            Giải thích: Endpoint này dùng để chia sẽ môt bài đăng nào đó như mạng xã hôi.
            Các tham số cần thiết từ BE(params):
            "PostId":không được phép null
            "Content":được phép null
            - EndPoint liên quan đến chấp nhận,đăng kí,ghép chuyến đi nào đó:
            -{base_url}/api/Ride/create
            Giải thích: EndPoint liên quan đến chấp nhận,đăng kí,ghép chuyến đi nào đó.
            Các tham số cần thiết từ BE(params):
            "DriverId":không được phép null
            "RidePostId":không được phép null
            "EstimatedDuration": luôn gán nó bằng 0
            "IsSafetyTrackingEnabled":không được phép null chỉ nhận 2 giá trị true/false (tức là nếu người dùng có ý định đồng ý thì là true ngược lại là false)
            **CHÚ Ý**:
            * Nếu trong {query} có dữ liệu nào liên quan đến params thì bỏ dữ liệu đó vào `"params":["param":"<Dữ liệu từ người dùng>", ...]`.
            * Nếu không có thì "params":["param":"<null or not null>", ...]
            * Sử dụng kỹ lịch sử chat {{chat_history}} và phân tích {{answer}} với {{Query}} mới của người dùng xem nó có liên quan không để tìm kiếm các thông tin cho các param **Lưu ý là phải tìm thật đúng**,nếu tìm không thấy hoặc không chắc chắn thì bỏ qua. 
            * Loại bỏ chữ "Query mới:" nếu có trong {query}
            * Ý nghĩa của các trường dữ liệu trong {{chat_history}}:
            * Các trường đã có dữ liệu trước đó: tức là các param đã có sẵn các giá trị.
            * Các trường còn thiếu dữ liệu**: tức là những trường cần bổ xung dữ liệu.
            * Endpoint yêu cầu**: Endpoint đã xác định trước đó.
            * Ngữ cảnh trước đó**: Câu hỏi của LLM để yêu cầu người dùng cung cấp thêm dữ liệu còn thiếu.
            * Kết hợp với "Query mới:" tức là dữ liệu được người dùng cung cấp hoặc nếu không phải dữ liệu mà các {{params}} cần thì bỏ qua.
            * Nếu query mới là một chuỗi văn bản đơn giản (không chứa hành động như "bình luận", "đăng bài") và lịch sử chat cho thấy đang chờ một tham số như Content, hãy gán query mới vào tham số đó và giữ nguyên endpoint, params, và missing_fields từ ngữ cảnh trước đó, chỉ cập nhật tham số liên quan.
            **Trả về định dạng json như sau**
            {{
                "query":{query},
                "endpoint":"<endpoint>",
                "params":{{"param":"<null or not null or data from user query>", ...}},
                "query_for_sql": "<phần câu hỏi cần truy vấn hoặc rỗng>",
                "missing_fields":["<các tham số chưa có dữ liệu chỉ các trường not null>",...]
            }}
            ví dụ: `query`:"tôi muốn đăng bài post với nội dung xin chao ae".
            JSON:
            {{
                "query":người dùng muốn đăng bài post với nội dung xin chao ae,
                "endpoint":"https://localhost:7053/api/Post/create",
                "params": {{'Content': 'xin chao ae', 'Images': 'null', 'Video': 'null', 'Scope': 'null'}},
                "query_for_sql": "",
                "missing_fields":['Scope']
            }}
            ví dụ nếu lịch sử chat hợp lý:
            JSON:
            {{
                "query":tất cả mọi người,
                "endpoint":"https://localhost:7053/api/Post/create",
                "params": {{'Content': 'xin chao ae', 'Images': 'null', 'Video': 'null', 'Scope': 'public'}},
                "query_for_sql": "",
                "missing_fields":[]
            }}
            **Ví dụ**:
            1. Câu hỏi: "bình luận bài đăng mới nhất của tôi với nội dung haha"
               Đầu ra:
               {{
                 "endpoint": "https://localhost:7053/api/Comment/CommentPost",
                 "params": {{"Content": "haha", "PostId": null}},
                 "query_for_sql": "bài đăng mới nhất của tôi",
                 "missing_fields": ["PostId"]
               }}
            2. Câu hỏi: "bình luận bài đăng tôi vừa mới đăng"
               Đầu ra:
               {{
                 "endpoint": "https://localhost:7053/api/Comment/CommentPost",
                 "params":{{"Content": "haha", "PostId": null}},
                 "query_for_sql": "bài đăng mới nhất của tôi",
                 "missing_fields": ["PostId"]
               }}
            2. Câu hỏi: "đăng bài với nội dung xin chào và mọi người đều xem"
               Đầu ra:
               {{
                 "endpoint": "https://localhost:7053/api/Post/create",
                 "params": {{"Content": "xin chào", "Scope": "public", "Images": null, "Video": null}},
                 "query_for_sql": "",
                 "missing_fields": []
               }}
            3. Câu hỏi: "bình luận bài đăng"
               Đầu ra:
               {{
                 "endpoint": "https://localhost:7053/api/Comment/CommentPost",
                 "params": {{"PostId": null, "Content": null}},
                 "query_for_sql": "",
                 "missing_fields": ["PostId", "Content"]
               }}
            4. Câu hỏi: "bài đăng mới nhất của tôi, nội dung abc" (sau khi AI hỏi "bài đăng nào và nội dung là gì")
               Đầu ra:
               {{
                 "endpoint": "https://localhost:7053/api/Comment/CommentPost",
                 "params": {{"Content": "abc", "PostId": null}},
                 "query_for_sql": "bài đăng mới nhất của tôi",
                 "missing_fields": ["PostId"]
               }}
            5. Câu hỏi:"tôi muốn tham gia 1 chuyến đi đến quang trung trong tầm 1h nữa".
                Đầu ra:
                {{
                    "endpoint": "https://localhost:7053/api/Ride/create",
                    "params": {{"DriverId": "null", "RidePostId": "null","EstimatedDuration":0,"IsSafetyTrackingEnabled":"null"}},
                    "query_for_sql": "chuyến đi đến quang trung trong tầm 1h nữa",
                    "missing_fields": ["DriverId","RidePostId","IsSafetyTrackingEnabled"]
                }}
            **Lưu ý**:Nếu không xác định được endpoint nào thì trả về Json như sau:
            {{
                "query":{query},
                "endpoint":"null",
                "params":{{}},
                "query_for_sql": "",
                "missing_fields":[]
            }}
            **Ví dụ ngữ cảnh gần nhất**:
            - Lịch sử chat:
            [
                {{"role": "user", "content": "comment vào bài post tôi mới đăng"}},
                {{"role": "assistant", "content": {{"answer": "Bạn muốn viết gì vào bài đăng vừa rồi?", "context": [{{"endpoint": "/api/Comment/CommentPost", "params": {{"PostId": "12345"}}, "missing_fields": ["Content"]}}]}}
            ]
            Query mới: "chào mọi người"
            Kết quả mong đợi:
            {{
            "query": "chào mọi người",
            "endpoint": "https://localhost:7053/api/Comment/CommentPost",
            "params": {{"PostId": "12345", "Content": "chào mọi người"}},
            "query_for_sql": "",
            "missing_fields": []
            }}
            - Lịch sử chat:
            [
            {{
                "role": "system",
                "content": "**Trường đã có dữ liệu**: {{'Content': None, 'Images': None, 'Video': None, 'Scope': None}}\n**Trường còn thiếu**: ['Content', 'Scope']\n**Endpoint yêu cầu**: https://localhost:7053/api/Post/create"
            }},
            {{
                "role": "assistant",
                "content": "Chào bạn! 😊  Để đăng bài, mình cần biết bạn muốn viết gì và ai có thể nhìn thấy bài đăng của bạn.  Bạn muốn viết gì nào? Và bạn muốn bài đăng này công khai hay chỉ bạn bè mình thấy thôi?"
            }},
            {{
                "role": "system",
                "content": "**Trường đã có dữ liệu**: {{'Content': 'xin chào mọi người', 'Images': None, 'Video': None, 'Scope': None}}\n**Trường còn thiếu**: ['Scope']\n**Endpoint yêu cầu**: https://localhost:7053/api/Post/create"
            }},
            {{
                "role": "assistant",
                "content": "Chào bạn! 😄  Bài đăng của bạn \"xin chào mọi người\" đã sẵn sàng. Bạn muốn ai có thể nhìn thấy bài đăng này?  (Mọi người, chỉ bạn bè, hoặc một nhóm riêng tư?)"
            }}
            ]
            người dùng gửi : "mọi người"
            Kết quả mong đợi:
            {{
            "query": "mọi người",
            "endpoint": "https://localhost:7053/api/Comment/CommentPost",
            "params": {{'Content': 'xin chào mọi người', 'Images': None, 'Video': None, 'Scope': "Public"}},
            "query_for_sql": "",
            "missing_fields": []
            }}
            - Lịch sử chat:
            [
            {{
                "role": "assistant",
                "content": "Chào bạn! 😊 Mình tìm thấy hai chuyến đi đến Quang Trung nè:
                1. Chuyến đi khởi hành từ Đại Học Duy Tân, Đà Nẵng đến 31 Đường Quang Trung, Đà Nẵng vào lúc 6:07 sáng ngày 11/05/2025.  Mã chuyến đi: CA96D72E-4219-4B3F-89F8-F7C076E5A401, Tài xế: 7437225F-8859-40DB-9B24-50279C5AF5C1
                2. Chuyến đi khởi hành từ Mầm Non Tư Thục Viên Ngọc, Hòa Vang, Đà Nẵng đến 31 Đường Quang Trung, Đà Nẵng vào lúc 5:47 chiều ngày 10/05/2025. Mã chuyến đi: 0CBA104B-3D31-4503-AA27-F973570248E2, Tài xế: 7437225F-8859-40DB-9B24-50279C5AF5C1
                Bạn muốn tham gia chuyến đi nào?  Cho mình biết số thứ tự (1 hoặc 2) hoặc mã chuyến đi nhé!"
            }}
            ]
            **Nếu người dùng gửi:"1",
            Kết quả mong đợi:
            {{
            "query": "1",
            "endpoint": "https://localhost:7053/api/Ride/create",
            "params": {{"DriverId": "7437225F-8859-40DB-9B24-50279C5AF5C1", "RidePostId": "CA96D72E-4219-4B3F-89F8-F7C076E5A401","EstimatedDuration":0,"IsSafetyTrackingEnabled":"null"}},
            "query_for_sql": "",
            "missing_fields": ["IsSafetyTrackingEnabled"]
            }}
            **Nếu người dùng gửi:"2",
            Kết quả mong đợi:
            {{
            "query": "1",
            "endpoint": "https://localhost:7053/api/Ride/create",
            "params": {{"DriverId": "7437225F-8859-40DB-9B24-50279C5AF5C1", "RidePostId": "0CBA104B-3D31-4503-AA27-F973570248E2","EstimatedDuration":0,"IsSafetyTrackingEnabled":"null"}},
            "query_for_sql": "",
            "missing_fields": ["IsSafetyTrackingEnabled"]
            }}
            **Ví dụ**:
            - Lịch sử chat:
            [
            {{
                "role": "system",
                "content": "**Trường đã có dữ liệu**: {{'DriverId': '7437225F-8859-40DB-9B24-50279C5AF5C1', 'RidePostId': '0CBA104B-3D31-4503-AA27-F973570248E2', 'EstimatedDuration': 0, 'IsSafetyTrackingEnabled': null}}\n**Trường còn thiếu**: ['IsSafetyTrackingEnabled']\n**Endpoint yêu cầu**: https://localhost:7053/api/Ride/create"
            }},
            {{
                "role": "assistant",
                "content": "Chào bạn! 😊 Bạn đang muốn tham gia chuyến đi này phải không? Bạn có muốn bật tính năng theo dõi an toàn không?"
            }}
            ]
            Query mới: "có"
            Kết quả mong đợi:
            {{
            "query": "có",
            "endpoint": "https://localhost:7053/api/Ride/create",
            "params": {{"DriverId": "7437225F-8859-40DB-9B24-50279C5AF5C1", "RidePostId": "0CBA104B-3D31-4503-AA27-F973570248E2", "EstimatedDuration": 0, "IsSafetyTrackingEnabled": true}},
            "query_for_sql": "",
            "missing_fields": []
            }}
            Query mới: "không"
            Kết quả mong đợi:
            {{
            "query": "không",
            "endpoint": "https://localhost:7053/api/Ride/create",
            "params": {{"DriverId": "7437225F-8859-40DB-9B24-50279C5AF5C1", "RidePostId": "0CBA104B-3D31-4503-AA27-F973570248E2", "EstimatedDuration": 0, "IsSafetyTrackingEnabled": false}},
            "query_for_sql": "",
            "missing_fields": []
            }}
            ** Tức là dựa vào {{query}} để xử lý đúng cho dữ liệu.**
            """,
        )

        try:
            # Format chat_history cho prompt
            formatted_history = json.dumps(
                chat_history, ensure_ascii=False, indent=2, default=self.default_encoder
            )

            # Gọi LLM để xử lý
            chain = preprocess_prompt | self.determine_llm
            result = await chain.ainvoke(
                {
                    "query": query,
                    "chat_history": formatted_history,
                    "base_url": self.base_url,
                    "sql_result": sql_result,
                }
            )
            logger.debug(f"Kết quả từ LLM: {result.content}")

            # Làm sạch và parse kết quả
            cleaned_content = re.sub(r"```json\n|\n```", "", result.content).strip()
            preprocess_result = json.loads(cleaned_content)

            # Kiểm tra và trả về kết quả
            normalized_query = preprocess_result.get("query", query)
            endpoint = preprocess_result.get("endpoint", [])
            params = preprocess_result.get("params", [])
            missing_fields = preprocess_result.get("missing_fields", [])
            query_for_sql = preprocess_result.get("query_for_sql", [])
            # Chuẩn hóa params
            params = normalize_params(params)
            logger.info(f"Chuẩn hóa params: {params}")
            return {
                "normalized_query": normalized_query,
                "endpoint": str(endpoint),
                "params": params,
                "missing_fields": missing_fields,
                "query_for_sql": query_for_sql,
            }
        except Exception as e:
            logger.error(f"Lỗi khi xử lý truy vấn: {str(e)}", exc_info=True)
            return {"normalized_query": query, "endpoint": [], "params": []}

    async def _generate_sql_query(
        self,
        query: str,
        user_id: str,
        missing_params: List[str],
        relevant_tables: List[str],
    ) -> tuple[str, list, Dict]:
        """Generate an SQL query based on the query, intent, role, user_id, relevant tables, and optional context."""
        actual_tables = [
            (
                self.data_loader.table_config[t]["table"]
                if t in self.data_loader.table_config
                else t
            )
            for t in relevant_tables
        ]
        schema = await self.data_loader.get_specific_schemas(actual_tables, "admin")
        if not schema:
            logger.error(
                f"Failed to generate SQL due to missing schema. Query: {query}, Relevant Tables: {relevant_tables}"
            )
            return "", []

        schema_description = "Table structure in UniversitySharingPlatform database:\n"
        for table, columns in schema.items():
            schema_description += f"\nTable {table}:\n"
            for col in columns:
                # Kiểm tra các thông tin bổ sung như bảng và cột tham chiếu
                referenced_info = ""
                if col.get("referenced_table") and col.get("referenced_column"):
                    referenced_info = f" (References {col['referenced_table']}.{col['referenced_column']})"

                # Cập nhật mô tả cột bao gồm tên cột, kiểu dữ liệu, ràng buộc và thông tin tham chiếu nếu có
                schema_description += f"  - {col['column_name']}: {col['data_type']} ({col['constraint']}){referenced_info}\n"
        logger.info(f"Schema description: {schema_description}")
        sql_prompt = PromptTemplate(
            input_variables=["query", "schema", "user_id", "missing_params"],
            template="""
            You are a useful AI expert in generating SQL statements, specifically designed to generate the most correct, best, and most reasonable queries to the user's question for Gemini 1.5 Flash.
            Always pay attention to the GROUPBY,HAVING,etc sections to avoid causing errors
            Based on the user question: {query}
            Database schema: {schema}
            Current UserId : {user_id}
            - **Note**: UserId refers to the ID of the user asking the question. Use it in the WHERE clause when the query relates to the user's own data or actions (e.g., "my posts", "my comments").
            Fields must always be present in the select statement: {missing_params}
            **NOTE**:The UserId here refers to the ID of the user currently asking the question. It should only be used when the user's question relates to their own data or actions.
            **NOTE**: Available columns are the columns that are available for the tables in the database. They are used to filter the data that is returned from the database.
            **Database Table Semantics & Relationships (Numeric Status/Type Codes):**
            **Semantics**: 
            * **`Users Table`**: The table is joined to all other tables. The record in Users is created when the user registers. The table is joined to RidePosts, Rides, Posts, FriendShips, Comments, Likes, Notifications, Conversations, Messages, Shares, and CommentLikes. The record in Users is created when the user registers.
            * **Users**: Stores basic user information. Primary Key: `Id`.
            * **`Posts Table`**: The table is joined to Likes, Shares, and Comments. The record in Posts is created when the user creates a post. The table is joined to Users, the record in Posts is created when the user creates a post.
            * **Posts**: Stores user-created posts (like Facebook status updates). Primary Key: `Id`. Foreign Key: `UserId` references `Users.Id`. Contains `Content`, `ImageUrl`, `VideoUrl`, `CreatedAt`.
            * **`Comments Table`**: The table is joined to Likes, Shares, and Posts. The record in Comments is created when the user comments on a post. The table is joined to Users, the record in Comments is created when the user comments on a post.
            * **Comments**: Stores comments on posts. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `PostId` references `Posts.Id`. Contains `Content`.
            * **`CommentLikes Table`**: The table is joined to Comments, the record in CommentLikes is created when the user likes a comment. The table is joined to Users, the record in CommentLikes is created when the user likes a comment.
            * **CommentLikes**: Tracks likes on comments. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `CommentId` references `Comments.Id`.
            * **`RidePosts Table`**: The table is joined to Rides, the record in RidePosts is created when the driver creates a ride offer and joined with the Users table to get the user poster details. The table is joined to Users, the record in RidePosts is created when the driver creates a ride offer and joined with the Users table to get the user poster details.
            * **RidePosts**: Represents **offers** or requests for shared rides. Primary Key: `Id`. Foreign Key: `UserId` references `Users.Id`. Contains `StartLocation`, `EndLocation`, `StartTime`, `Content`, `Status` (Integer: 0: open, 1: Matched, 2: Canceled). **Use this table when users search for available rides or view ride offers they created.**  
            **General SQL Generation Requirements:**
                **NOTE**:ONLY USING SQL SERVER CODE.
            1.  **SELECT Only**: Only generate `SELECT` queries. Do not generate `INSERT`, `UPDATE`, or `DELETE`.
            2.  **Primary and Foreign Keys**:
                * **ALWAYS** include the **Primary Key** (`Id`) of the main table(s) being queried in the `SELECT` list.
                * **ALWAYS** include all **Foreign Key** columns of the main table(s) and related tables involved in `JOIN` clauses, as specified in the schema (e.g., `UserId`, `PostId`, `RidePostId`, `DriverId`, `PassengerId`, `SenderId`, `ReceiverId`, `FriendId`, `UserId1`, `User2Id`, `ReportedBy`, `CommentId`, `ConversationId`, etc.).
                * For each table involved in the query (either in `FROM` or `JOIN`), ensure its **Primary Key** and any **Foreign Keys** (as indicated by `References` in the schema) are included in the `SELECT` list, using appropriate table aliases if needed.
                * Example: For a query on `RidePosts` joined with `Users`, include `RidePosts.Id` (Primary Key), `RidePosts.UserId` (Foreign Key), and `Users.Id` (Primary Key of `Users`).
                ### ALWAYS include the following columns in the `SELECT` list:
                - Users(Id, FullName, ...)
                - Comments(Id, UserId, PostId, ...)
                - Posts(Id, UserId,...)
            3.  **User Context (`user_id`)**:
                * For intents explicitly about the current user's data (e.g., `my-posts`, `my-friends`, `my-notifications`, `user-conversations`, `my-rides`) or when the query implies possession ("show me *my* posts", "who are *my* friends"), **ALWAYS** filter based on the current user's ID. Use the `{user_id}` variable provided.
                * Example filter for posts: `WHERE Posts.UserId = ?` (and pass `{user_id}` as the parameter).
            5.  **JOINs**:
                * When retrieving data that includes user information (e.g., post author, commenter, liker, friend, sender, receiver, driver, passenger, reporter), **JOIN** with the `Users` table using the appropriate foreign key (e.g., `Posts.UserId`, `Comments.UserId`, `Notifications.SenderId`, `Rides.PassengerId`, `Messages.SenderId`, `Reports.ReportedBy`, etc.).
                * Include relevant user details like `Users.FullName` in the `SELECT` list.
            6.  **Column Selection**: Columns in the `SELECT` list must only come from tables listed in the `FROM` or `JOIN` clauses. Validate column names against the provided `{schema}`.
            7.  **Placeholders**: Use SQL placeholders (`?`) for all dynamic values derived from the user query or context (`{user_id}`, search terms, etc.).
            8. **Time Select**: If the question is related to time properties (latest, oldest, current,...etc) in SELECT, a time-related field is required.
            9. **If the query involves "all" use the TOP 10 statement to limit the number of records returned.**
            10. **Note on using GROUPBY for count statements**
            **Table-specific Logic & Filters (Numeric Status/Type Codes):**
            * **`Users Table`**:Likely filter: `FullName LIKE ?` using a parameter derived from `{query}`.
            * **`Posts Table`**:
                            * Filter: `WHERE Posts.UserId = ?` (if the query is about the user's posts). Pass `{user_id}`.
                            * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted posts.
                            * Filter based on `{query}` (e.g., `Content LIKE ?`).
                            * Filter by `CreatedAt` if the query is time-related (e.g., `CreatedAt >= ?`).
                            * Only apply `PostType` equal to `0` or `1` (0 is type public). 
                            * Join with `Users` on `Posts.UserId` to get the poster's info.
            * **`Comments Table`**:
                            * Only create the query when the question implies user ownership.
                            * The table is joined to CommentLikes, the record in Comments is created when the user comments on a post.
                            * The table is joined to Users, the record in Comments is created when the user comments on a post.
                            * The table is joined to Posts, the record in Comments is created when the user comments on a post.
                            * Just like Posts, the table is joined to Likes and Shares, the record in Comments is created when the user comments on a post.
                            * Filter: `WHERE Comments.UserId = ?` (if the query is about the user's comments). Pass `{user_id}`.
                            * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted comments.
                            * Filter based on `{query}` (e.g., `Content LIKE ?`).
                            * Filter by `CreatedAt` if the query is time-related (e.g., `CreatedAt >= ?`).
                            * Join with `Users` on `Comments.UserId` to get the commenter's info.
                            * Join with `Posts` on `Comments.PostId` to get post details if needed.
            * **`RidePosts Table`**:
                    * Alway using 
                    WHERE 
                    rp.EndLocation LIKE ? 
                    AND rp.Status = 0
                    AND rp.StartTime >= ?
                    AND rp.IsDeleted = 0
                    And rp.UserId != {user_id}
                    * Location Filters: Use `LIKE ?` with wildcards (e.g., `%location%`) for `StartLocation` and `EndLocation`.
                    * Join with `Users` on `RidePosts.UserId` to get the poster's info.
            * **Example** *
                    Query:" chuyến đi đến quang trung trong tầm 1h nữa"
                    SQL:"
                    SELECT TOP 10 
                        rp.Id AS RidePostId,
                        rp.StartLocation,
                        rp.EndLocation,
                        rp.StartTime,
                        rp.UserId,
                        u.Id AS DriverId,
                        r.IsSafetyTrackingEnabled
                    FROM RidePosts rp
                    LEFT JOIN Rides r ON rp.Id = r.RidePostId
                    LEFT JOIN Users u ON rp.UserId = u.Id
                    WHERE 
                        rp.EndLocation LIKE '%Quang Trung%' 
                        AND rp.Status = 0
                        AND rp.StartTime >= DATEADD(HOUR, 1, GETDATE())
                        AND rp.IsDeleted = 0
                        And rp.UserId != {user_id}
                    ORDER BY rp.StartTime ASC;     
                    ".
            * Only create the query when the question implies user ownership.
                    * The table is joined to Comments, the record in CommentLikes is created when the user likes a comment.
                    * The table is joined to Users, the record in CommentLikes is created when the user likes a comment.
                    * Filter: `WHERE CommentLikes.UserId = ?` (if the query is about the user's comment likes). Pass `{user_id}`.
                    * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted comment likes.
                    * Filter based on `{query}` (e.g., `Content LIKE ?`).
                    * Join with `Users` on `CommentLikes.UserId` to get the user's info.
                    * Join with `Comments` on `CommentLikes.CommentId` to get comment details if needed.
            **NOTE**: 
            * If the question is not related to the data or the system's tables, return False; otherwise, return True (Type).
            * If the user wants to know internal system information, return False(Type) and raise a warning(Alert).
            * Always using WHERE UserId = {user_id}
            * Pay attention to the user's {query} and create the query according to the request, for example:Query  "My latest post" means to find their latest post, not to find TOP 10.
            * That is, pay attention to whether the SELECT statements return the correct number of records requested, 1 or 10.
            **Output Format:**
            Return a **strict JSON object** containing two keys:
            1.  `sql`: The generated SQL query string.
            2.  `params`: A list containing the values for the SQL placeholders (`?`) in the correct order.
""",
        )

        try:
            chain = sql_prompt | self.sql_llm
            start_time = time_module.time()
            async with asyncio.timeout(30.0):
                result = await chain.ainvoke(
                    {
                        "query": query,
                        "schema": schema_description,
                        "user_id": user_id,
                        "missing_params": missing_params,
                    }
                )
                # json.dumps(context) if context else "{}"
            logger.info(
                f"Generate SQL took {time_module.time() - start_time:.2f} seconds"
            )

            cleaned_content = re.sub(r"```json\n|\n```", "", result.content).strip()
            sql_data = json.loads(cleaned_content)
            sql = sql_data.get("sql", "")
            params = sql_data.get("params", [])
            logger.info(f"Generated SQL create: {sql}, Params: {params}")
            params = [str(p).encode("utf-8").decode("utf-8") for p in params]
            context = {
                "query": query,
                "user_id": user_id,
                "relevant_tables": relevant_tables,
                "schema_description": schema_description,
                "prompt": sql_prompt.format(
                    query=query,
                    schema=schema_description,
                    user_id=user_id,
                    missing_params=missing_params,
                ),
            }
            return sql, params, context
        except Exception as e:
            logger.error(f"Error generating SQL: {str(e)}", exc_info=True)
            return "", [], {}

    async def generate_answer_create_stream_async(
        self,
        query: str,
        user_id: str,
        conversation_id: str,
        role: str,
        action_type: str,
        missing_params: Optional[List[Dict]] = None,
        relevant_tables: Optional[List[str]] = None,
        normalized_query: Optional[str] = None,
        chat_history: List[Dict] = None,
    ) -> AsyncIterator[Dict]:
        state_key = f"conversation:{conversation_id}:{user_id}"
        full_response = ""
        max_history_items = 50
        try:
            # 1.2. Lấy lịch sử từ Redis
            params = {}
            missing_fields = []
            endpoint = ""
            timestamp = None
            history_length = await self.redis.llen(state_key)
            chat_history = []
            sql_result = []
            if history_length > 0:
                last_item = await self.redis.lindex(state_key, -1)  # Lấy item cuối cùng
                try:
                    state = json.loads(last_item)
                    if isinstance(state, dict) and "chat_history" in state:
                        chat_history = state["chat_history"]
                        params = state.get("params", {})
                        missing_fields = state.get("missing_fields", [])
                        endpoint = state.get("endpoint", "")
                        sql_result = state.get("sql_result", [])
                        ttimestamp = state.get("timestamp", timestamp)
                except json.JSONDecodeError as e:
                    logger.error(
                        f"Failed to decode Redis item: {last_item}, error: {e}"
                    )
            # Chuẩn hóa chat_history
            chat_history = [
                item
                for item in chat_history
                if isinstance(item, dict) and "role" in item and "content" in item
            ]
            # Format timestamp (nếu có)
            formatted_time = "Không rõ thời gian"
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp)
                    formatted_time = dt.strftime("%d/%m/%Y %H:%M:%S")
                except ValueError:
                    logger.warning(f"Không thể parse timestamp: {timestamp}")
            # Ghi log lịch sử chat
            chat_history_str = json.dumps(
                chat_history, ensure_ascii=False, indent=2, default=self.default_encoder
            )
            logger.info(f"Lịch sử trò chuyện:\n{chat_history_str}")

            # Gán mặc định nếu chưa có
            missing_params = missing_params or []
            relevant_tables = relevant_tables or [
                "Posts",
                "Comments",
                "Users",
                "CommentLikes",
                "RidePosts",
            ]

            # 2. Phân tích query để xác định endpoint, params, và missing_fields
            results_detemine_endpoint = await self._Determine_endpoint_create_async(
                query, chat_history, sql_result
            )
            if not isinstance(results_detemine_endpoint, dict):
                logger.error(
                    f"Invalid results format from _Determine_endpoint_create_async: {results_detemine_endpoint}"
                )
                yield {"type": "error", "content": "Lỗi xử lý yêu cầu."}
                return

            normalized_query = results_detemine_endpoint.get("normalized_query", query)
            endpoint = results_detemine_endpoint.get("endpoint", "")
            params = results_detemine_endpoint.get("params", {})
            missing_fields = results_detemine_endpoint.get("missing_fields", [])
            query_for_sql = results_detemine_endpoint.get("query_for_sql", "")

            self.normalized_query = normalized_query
            self.relevant_tables = relevant_tables

            if endpoint == "null":
                yield {
                    "type": "error",
                    "content": "Không xác định được hành động yêu cầu hoặc bạn không có quyền thực hiện. Vui lòng thử lại.",
                }
                return
            sql_result = []
            # 3. Xử lý trường hợp có query_for_sql
            if query_for_sql:
                logger.info(f"Generating SQL for query: {query_for_sql}")
                sql, sql_params, context = await self._generate_sql_query(
                    query_for_sql, user_id, missing_fields, relevant_tables
                )
                if not sql:
                    yield {
                        "type": "error",
                        "content": "Không thể tạo truy vấn dữ liệu. Vui lòng thử lại.",
                    }
                    return
                sql_result = []
                try:
                    logger.info(f"Executing SQL query: {sql} with params: {sql_params}")
                    sql_result = await self.data_loader._execute_query_llm_async(
                        sql, sql_params, context
                    )

                    if isinstance(sql_result, tuple):
                        success, query, params, error_message = sql_result
                        logger.error(f"SQL query failed: {error_message}")
                        yield {
                            "type": "error",
                            "content": f"Không thể thực thi truy vấn: {error_message}. Vui lòng thử lại.",
                        }
                        return

                    if not isinstance(sql_result, list):
                        logger.error(f"sql_result is not a list: {type(sql_result)}")
                        yield {
                            "type": "error",
                            "content": "Dữ liệu trả về không đúng định dạng. Vui lòng thử lại.",
                        }
                        return

                    if not sql_result:
                        yield {
                            "type": "chunk",
                            "content": "không tìm thấy dữ liệu cho câu hỏi của bạn.",
                        }
                        yield {
                            "type": "final",
                            "content": "không tìm thấy dữ liệu cho câu hỏi của bạn.",
                        }
                        await self.redis.delete(state_key)
                        return
                    logger.info(f"SQL query result: {sql_result}")

                    # Chuẩn hóa params thành dict
                    params_dict = params
                    if (
                        isinstance(params, list)
                        and len(params) > 0
                        and isinstance(params[0], dict)
                    ):
                        params_dict = params[0]
                    elif not isinstance(params, dict):
                        logger.error(
                            f"params is not a dict or list of dict: {type(params)}"
                        )
                        yield {
                            "type": "error",
                            "content": "Tham số không đúng định dạng. Vui lòng thử lại.",
                        }
                        return
                    # Xử lý kết quả SQL
                    if len(sql_result) > 1:
                        # Nhiều kết quả: Yêu cầu người dùng chọn
                        query_columns = (
                            [key for key in sql_result[0].keys()] if sql_result else []
                        )
                        results_detemine_own = self._determine_is_own_data(
                            sql_result, user_id, relevant_tables, role, query_columns
                        )
                        results_detemine_own = [
                            r
                            for r in results_detemine_own
                            if not r.get("isOwner", False)
                        ]
                        logger.info(f"Multiple results found: {results_detemine_own}")

                        response_chunks = []
                        async for chunk in self._stream_create_response(
                            normalized_query,
                            missing_fields,
                            results_detemine_own,
                            endpoint,
                            params,
                        ):
                            response_chunks.append(chunk)
                            yield {"type": "chunk", "content": chunk}
                        full_response = "".join(response_chunks)
                        chat_history.append(
                            {"role": "assistant", "content": full_response}
                        )

                        # Lưu trạng thái vào Redis
                        await self.redis.rpush(
                            state_key,
                            json.dumps(
                                {
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "params": params_dict,
                                    "missing_fields": missing_fields,
                                    "endpoint": endpoint,
                                    "chat_history": chat_history,
                                    "type": action_type,
                                    "normalized_query": normalized_query,
                                    "relevant_tables": relevant_tables,
                                    "sql_result": sql_result,
                                },
                                default=self.default_encoder,
                            ),
                        )

                        if await self.redis.llen(state_key) > max_history_items:
                            await self.redis.ltrim(state_key, -max_history_items, -1)

                        results = [
                            {
                                "normalized_query": normalized_query,
                                "endpoint": endpoint,
                                "params": params_dict,
                                "missing_fields": missing_fields,
                                "action_type": action_type,
                                "redis_key": state_key,
                            }
                        ]
                        yield {
                            "type": "final",
                            "data": {
                                "normalized_query": normalized_query,
                                "response": full_response,
                                "token_count": self.ans._count_tokens(full_response),
                                "results": results,
                                "type": action_type,
                            },
                        }
                        return

                    # Một kết quả: Ánh xạ dữ liệu vào params
                    result_row = sql_result[0]
                    if not isinstance(result_row, dict):
                        if isinstance(result_row, (list, tuple)) and context.get(
                            "columns"
                        ):
                            columns = context.get("columns", [])
                            if len(columns) == len(result_row):
                                result_row = dict(zip(columns, result_row))
                            else:
                                logger.error(
                                    f"Cannot convert sql_result[0] to dict: mismatched columns and values"
                                )
                                yield {
                                    "type": "error",
                                    "content": "Dữ liệu trả về không đúng định dạng. Vui lòng thử lại.",
                                }
                                return
                        else:
                            logger.error(
                                f"Cannot handle sql_result[0] type: {type(result_row)}"
                            )
                            yield {
                                "type": "error",
                                "content": "Dữ liệu trả về không đúng định dạng. Vui lòng thử lại.",
                            }
                            return

                    # Ánh xạ missing_fields với cột trong sql_result
                    field_mapping = {
                        "PostId": ["PostId", "Id"],
                        "CommentId": ["CommentId", "Id"],
                        "ParentCommentId": ["ParentCommentId", "CommentId", "Id"],
                        "FriendId": ["FriendId", "UserId", "Id"],
                        "RidePostId": ["RidePostId", "Id"],
                        "DriverId": ["DriverId", "UserId"],
                    }

                    updated_fields = []
                    for field in missing_fields:
                        if field in field_mapping:
                            for possible_column in field_mapping[field]:
                                if possible_column in result_row:
                                    params_dict[field] = result_row[possible_column]
                                    updated_fields.append(field)
                                    logger.info(
                                        f"Updated {field} with value {params_dict[field]} from column {possible_column}"
                                    )
                                    break

                    missing_fields = [
                        f for f in missing_fields if f not in updated_fields
                    ]
                    params = params_dict

                except Exception as e:
                    logger.error(f"Lỗi khi thực thi SQL: {str(e)}", exc_info=True)
                    yield {
                        "type": "error",
                        "content": "Lỗi khi xử lý truy vấn dữ liệu. Vui lòng thử lại.",
                    }
                    return

            # 4. Xử lý trường hợp còn thiếu tham số
            if missing_fields:
                logger.info(f"Missing fields: {missing_fields}")
                chat_history.append(
                    {
                        "role": "system",
                        "content": (
                            f"**Trường đã có dữ liệu**: {params}\n"
                            f"**Trường còn thiếu**: {missing_fields}\n"
                            f"**Endpoint yêu cầu**: {endpoint}"
                            f"**vào lúc: {formatted_time}"
                        ),
                    }
                )

                results_detemine_own = []
                if sql_result:
                    query_columns = (
                        [key for key in sql_result[0].keys()] if sql_result else []
                    )
                    results_detemine_own = self._determine_is_own_data(
                        sql_result, user_id, relevant_tables, role, query_columns
                    )
                    results_detemine_own = [
                        r for r in results_detemine_own if not r.get("isOwner", False)
                    ]

                response_chunks = []
                async for chunk in self._stream_create_response(
                    normalized_query,
                    missing_fields,
                    results_detemine_own,
                    endpoint,
                    params,
                ):
                    response_chunks.append(chunk)

                    response_chunks.append(chunk)
                    yield {"type": "chunk", "content": chunk}
                full_response = "".join(response_chunks)
                chat_history.append({"role": "assistant", "content": full_response})

                await self.redis.rpush(
                    state_key,
                    json.dumps(
                        {
                            "timestamp": datetime.utcnow().isoformat(),
                            "params": params,
                            "missing_fields": missing_fields,
                            "endpoint": endpoint,
                            "chat_history": chat_history,
                            "type": action_type,
                            "normalized_query": normalized_query,
                            "relevant_tables": relevant_tables,
                        },
                        default=self.default_encoder,
                    ),
                )

                if await self.redis.llen(state_key) > max_history_items:
                    await self.redis.ltrim(state_key, -max_history_items, -1)

                results = [
                    {
                        "normalized_query": normalized_query,
                        "endpoint": endpoint,
                        "params": params,
                        "missing_fields": missing_fields,
                        "action_type": action_type,
                        "redis_key": state_key,
                    }
                ]
                final_data = {
                    "type": "final",
                    "data": {
                        "normalized_query": normalized_query,
                        "response": full_response,
                        "token_count": self.ans._count_tokens(full_response),
                        "results": results,
                        "type": action_type,
                    },
                }
                logging.info(
                    "Yielding final data: %s",
                    json.dumps(
                        final_data,
                        indent=2,
                        ensure_ascii=False,
                        default=self.default_encoder,
                    ),
                )

                yield final_data
                return

            # 5. Trường hợp đủ thông tin
            messages = [
                "Bạn vui lòng kiểm tra lại thông tin bên dưới giúp mình nhé. 😄",
                "Hãy xác nhận xem các thông tin sau đã đúng chưa bạn nhé. 👍",
                "Mình cần bạn xác nhận lại những thông tin này trước khi tiếp tục. ✅",
                "Vui lòng xem lại thông tin sau và xác nhận nếu không có gì sai sót. ✔️",
                "Bạn có thể xác nhận giúp mình các thông tin dưới đây không? 🙏",
                "Nếu mọi thứ đã đúng, bạn xác nhận để mình tiến hành bước tiếp theo nhé. ✅",
                "Trước khi xử lý, bạn hãy kiểm tra và xác nhận lại thông tin nhé. 🔍",
                "Mình vừa tổng hợp lại thông tin, bạn xem và xác nhận giúp mình. 📋",
                "Bạn vui lòng rà soát lại thông tin và xác nhận nhé. 👀",
                "Kiểm tra lại giúp mình xem những thông tin sau đã chính xác chưa nhé. 😊",
            ]
            results = [
                {
                    "normalized_query": normalized_query,
                    "endpoint": endpoint,
                    "params": params,
                    "missing_fields": missing_fields,
                    "action_type": action_type,
                    "redis_key": state_key,
                    "query": normalized_query,
                    "answer": "Hành động đang thực thi",
                }
            ]

            yield {"type": "chunk", "content": random.choice(messages)}
            yield {"type": "complete", "content": results}
            logger.info(f"Completed action: {results}")

        except Exception as e:
            logger.exception("Error in generate_answer_create_stream_async")
            yield {
                "type": "error",
                "content": "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.",
            }

    async def _stream_create_response(
        self,
        query: str,
        params: List[str],
        results: List[Dict[str, any]],
        endpoint: str = "",
        provided_params: Dict[str, any] = None,
        flag: bool = False,
    ) -> AsyncIterator[str]:
        """Streams the response from the LLM, tailored to the specific endpoint and missing parameters."""
        full_response_for_logging = ""
        base_template = """
        You are a friendly AI for a university student social network, tasked with prompting users to provide missing information in a natural, conversational way. Avoid technical terms like **PostId** or **endpoint**, and use everyday language that students can easily understand.

**Project Description**:
The platform is a social network for university students, enabling:
- Posting, commenting, liking, and sharing.
- Sending friend requests and messaging.
- Joining or registering rides.

**User Query**:
{question}

**Endpoint**:
{endpoint}

**Provided Parameters**:
{provided_params}

**Missing Parameters**:
{context}

**Results Found**:
{results}

**Task**:
- Analyze the **question**, **endpoint**, **provided_params**, **context** (a list of missing parameters, e.g., ["Content"]), and **results**.
- Translate each missing parameter in **context** into natural language based on the endpoint's context.
- Generate a friendly, conversational response asking the user to provide only the missing information.
- Do not ask for parameters already provided in **provided_params** (e.g., if **PostId** is provided, do not ask "which post").
- Tailor the response to the specific action implied by the **endpoint** (e.g., commenting, posting, joining a ride).
- If no missing parameters are provided, inform the user that all required information is ready and ask for confirmation.
- Incorporate **results** to provide relevant information to the user, but exclude any fields containing **Id** (e.g., **PostId**, **UserId**). Format the results naturally within the response.

**Rules**:
- Use a warm, engaging tone, like chatting with a friend.
- For each missing parameter, provide a clear, specific question.
- Avoid generic responses. Make the response relevant to the **query**, **endpoint**, and action.
- If the **endpoint** is related to commenting and **PostId** is provided, mention that the comment will be added to the specified post.
- Response must be in **Vietnamese**.

**Parameter Translations**:
- **PostId**: "Which post" or "the post you want to [action]."
- **CommentId**: "Which comment" or "the comment you want to [action]."
- **ParentCommentId**: "The comment you're replying to."
- **FriendId**: "Who you want to send the friend request to."
- **Content**: "What you want to say" or "the text/content of your [post/comment]."
- **Scope**: "Who can see your post" (e.g., public, friends).
- **Images**: "Any images you want to include."
- **Video**: "Any video you want to include."
- **DriverId**: "The driver for the ride."
- **RidePostId**: "The ride you want to join."
- **IsSafetyTrackingEnabled**: "Whether you want safety tracking enabled."

**Output Format**:
A natural language response in plain text, asking for the missing information or confirming readiness, incorporating **results** (excluding **Id** fields) naturally.

**Examples**:
1. **Query**: "Comment on my latest post"
   **Endpoint**: "/api/Comment/CommentPost"
   **Provided Params**: {{PostId: 12345}}
   **Context**: [Content]
   **Results**: {{Content: This is a great post!, CreatedAt: 2025-05-10}}
   **Output**: Chào bạn! 😊 Bạn muốn bình luận gì vào bài đăng có nội dung "This is a great post!" vừa rồi?

2. **Query**: "Comment on a post"
   **Endpoint**: "/api/Comment/CommentPost"
   **Provided Params**: {{}}
   **Context**: [PostId, Content]
   **Results**: {{Content: Nice event!, CreatedAt: 2025-05-09}}
   **Output**: Chào bạn! 😊 Bạn muốn bình luận vào bài đăng nào, ví dụ như bài có nội dung "Nice event!"? Và bạn muốn nói gì nhỉ?

3. **Query**: "Create a post"
   **Endpoint**: "/api/Post/create"
   **Provided Params**: {{Content: Hello world}}
   **Context**: [Scope]
   **Results**: {{}}
   **Output**: Chào bạn! 😄 Bài đăng của bạn đã có nội dung "Hello world" rồi. Bạn muốn ai nhìn thấy bài này? Mọi người hay chỉ bạn bè?

4. **Query**: "Join a ride"
   **Endpoint**: "/api/Ride/Create"
   **Provided Params**: {{RidePostId: ABC123, DriverId: USER001}}
   **Context**: [IsSafetyTrackingEnabled]
   **Results**: {{Destination: Campus A, DepartureTime: 2025-05-11 08:00}}
   **Output**: Chào bạn! 😊 Bạn muốn tham gia chuyến đi đến Campus A lúc 8h sáng ngày 11/05/2025. Bạn có muốn bật tính năng theo dõi an toàn không?

**Response**:
        """

        results_template = """
        You are a friendly AI assistant for a university student social network, tasked with helping users select an item from a list of available results (e.g., posts, comments, users, rides) in a natural, conversational way. Use everyday language that students can easily understand, avoiding technical terms like "PostId," "CommentId," or "RidePostId."

        **Project Description**:
        The platform is a social network for university students, enabling:
        - Posting, commenting, liking, and sharing.
        - Sending friend requests and messaging.
        - Joining or registering rides.

        **User Query**:
        {question}

        **Endpoint**:
        {endpoint}

        **Available Results**:
        {results}

        **Missing Parameters**:
        {context}

        **Task**:
        - Determine the type of results (e.g., posts, comments, users, rides) based on the query and results provided.
        - Present the list of available results in a clear, numbered format (1, 2, 3, ...).
        - For each result, include key details relevant to the type (e.g., for a post: content and author; for a ride: start location, destination, and time; for a user: name or ID).
        - Translate technical fields into natural language (e.g., "PostId" as "mã bài đăng," "RidePostId" as "mã chuyến đi," "FriendId" as "người dùng").
        - Ask the user to choose a result by providing the corresponding number or identifier (e.g., post ID, ride ID).
        - Use a friendly, engaging tone, like chatting with a friend.
        - If no results are found, respond with "Không tìm thấy dữ liệu phù hợp với bạn 😔" in a friendly way.
        - Ensure the response is concise and easy to understand.

        **Output Format**:
        A natural language response (plain text) listing the results and asking the user to choose one.

        **Examples**:
        1. Query: "Tham gia chuyến đi đến Quang Trung"
        Endpoint: "/api/Ride/Create"
        Available Results: [
            {{"RidePostId": "AA11F9AF-D23E-47FD-985F-203A07B37515", "DriverId": "7437225F-8859-40DB-9B24-50279C5AF5C1", "StartLocation": "Cafe Minsk, Hòa Tiến", "EndLocation": "Quang Trung", "StartTime": "2025-07-14 22:25"}},
            {{"RidePostId": "B13249F6-7E78-4E43-8CA7-3E93DCDECC9B", "DriverId": "CFA82DCE-5902-4419-A6A1-3D8066BAD303", "StartLocation": "Quán Bún Vân, Cẩm Lệ", "EndLocation": "Quang Trung", "StartTime": "2025-08-08 13:02"}}
        ]
        Output: "Chào bạn! 😊 Mình đã tìm thấy một số chuyến đi đến Quang Trung phù hợp:\n
        1. Chuyến đi từ Cafe Minsk, Hòa Tiến đến Quang Trung vào lúc 2025-07-14 22:25. Mã chuyến đi: AA11F9AF-D23E-47FD-985F-203A07B37515, Người lái xe: 7437225F-8859-40DB-9B24-50279C5AF5C1.\n
        2. Chuyến đi từ Quán Bún Vân, Cẩm Lệ đến Quang Trung vào lúc 2025-08-08 13:02. Mã chuyến đi: B13249F6-7E78-4E43-8CA7-3E93DCDECC9B, Người lái xe: CFA82DCE-5902-4419-A6A1-3D8066BAD303.\n
        Bạn muốn chọn chuyến đi nào? Vui lòng cho mình số thứ tự (1, 2, ...) hoặc mã chuyến đi nhé!"

        2. Query: "Bình luận vào bài đăng về bóng đá"
        Endpoint: "/api/Comment/CommentPost"
        Available Results: [
            {{"PostId": "12345", "Content": "Ai thích bóng đá không?", "Author": "Nam"}},
            {{"PostId": "67890", "Content": "Tối nay có trận bóng đỉnh!", "Author": "Hùng"}}
        ]
        Output: "Chào bạn! 😄 Mình tìm thấy một số bài đăng về bóng đá:\n
        1. Bài đăng của Nam: 'Ai thích bóng đá không?' (Mã bài đăng: 12345)\n
        2. Bài đăng của Hùng: 'Tối nay có trận bóng đỉnh!' (Mã bài đăng: 67890)\n
        Bạn muốn bình luận vào bài nào? Cho mình số thứ tự (1, 2, ...) hoặc mã bài đăng nhé!"

        **Using Vietnamese to response**
        **Response**:
        """
        none_results_template = """
        You are a friendly AI assistant for a university student social network, tasked with helping users select an item from a list of available results (e.g., posts, comments, users, rides) in a natural, conversational way. Use everyday language that students can easily understand, avoiding technical terms like "PostId," "CommentId," or "RidePostId."
        **User Query**:
        {question}
        **Available Results**:
        {results}
        **Nếu bạn không nhận được kết quả nào từ {{Results}} hãy trả lời một cách thân thiện là không tìm thấy dữ liệu cho câu hỏi của bạn.
        **Using Vietnamese to response**
        **Response**:
        """
        if len(results) >= 2:
            template = results_template
            logger.info("if len(results) >= 2:")
        else:
            template = base_template
            logger.info("base_template")
        prompt = PromptTemplate(
            input_variables=[
                "question",
                "context",
                "results",
                "endpoint",
                "provided_params",
            ],
            template=template.strip(),
            # Loại bỏ khoảng trắng thừa
        )
        chain = prompt | self.llm

        response_stream = chain.astream(
            {
                "question": query,
                "context": json.dumps(
                    params, ensure_ascii=False, default=self.default_encoder
                ),
                "results": json.dumps(
                    results, ensure_ascii=False, default=self.default_encoder
                ),
                "endpoint": endpoint,
                "provided_params": json.dumps(
                    provided_params or {},
                    ensure_ascii=False,
                    default=self.default_encoder,
                ),
            }
        )

        logger.info("Starting to receive chunks from LLM stream...")
        try:
            async for chunk in response_stream:
                content = getattr(chunk, "content", str(chunk))
                if content:
                    full_response_for_logging += content
                    logger.info(f"Yielding raw chunk: '{content}'")
                    yield content
            logger.info("Finished streaming response.")
            logger.info(
                f"Full response generated by LLM: '{full_response_for_logging}'"
            )
        except Exception as e:
            logger.error(f"Error during streaming response: {str(e)}", exc_info=True)
            yield "Xin lỗi, có lỗi xảy ra khi tạo phản hồi. Vui lòng thử lại."

    def _determine_is_own_data(
        self,
        results: List[Dict[str, any]],
        user_id: str,
        relevant_tables: List[str],
        user_role: str,
        query_columns: Optional[List[str]] = None,  # Thêm tham số mới
    ) -> List[Dict[str, any]]:
        user_id_lower = str(user_id).lower()
        user_role = user_role.lower()

        # Nếu có query_columns, xác định các trường alias
        alias_columns = set(query_columns or []) - set(
            col
            for table in relevant_tables
            for col in self.data_loader.table_config.get(table, {}).get("columns", [])
        )

        for record in results:
            is_owner = False
            own_columns_set = set()
            allowed_columns_set = set()

            for table in relevant_tables:
                table_config = self.data_loader.table_config.get(table, {}) or {}
                user_id_fields = table_config.get("user_id_fields", [])

                # Gộp các cột được phép theo role
                permissions = table_config.get("permissions", {}).get(user_role, {})
                own_columns_set.update(permissions.get("own_columns", []))
                allowed_columns_set.update(permissions.get("allowed_columns", []))

                # Kiểm tra sở hữu
                for field in user_id_fields:
                    value = record.get(field)
                    if value and str(value).lower() == user_id_lower:
                        is_owner = True
                        break

                # Các trường hợp đặc biệt
                if table == "Friendships" and not is_owner:
                    if (
                        str(record.get("FriendId", "")).lower() == user_id_lower
                        and record.get("Status") == 1
                    ):
                        is_owner = True
                elif table == "Conversations" and not is_owner:
                    if (
                        str(record.get("User1Id", "")).lower() == user_id_lower
                        or str(record.get("User2Id", "")).lower() == user_id_lower
                    ):
                        is_owner = True

                if is_owner:
                    break

            # Gắn cờ
            record["isOwner"] = is_owner
            final_allowed_fields = own_columns_set if is_owner else allowed_columns_set

            # Thêm các trường alias vào final_allowed_fields
            final_allowed_fields.update(alias_columns)

        return results
