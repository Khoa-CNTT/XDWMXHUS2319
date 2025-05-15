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
from config import GOOGLE_API_KEY_QUERY, GOOGLE_API_KEY_LLM
from langchain.prompts import PromptTemplate
from answer_generator import AnswerGenerator
import time as time_module
from redis.asyncio import Redis
from data_loader import DataLoader

logger = logging.getLogger(__name__)


class DeleteQueryProcessor:
    def __init__(self):
        self.sql_llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY_QUERY,
            temperature=0,
            max_output_tokens=2024,
            disable_streaming=False,  # Bật streaming
        )
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY_LLM,
            temperature=0.5,
            max_output_tokens=2024,
            disable_streaming=False,
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

    async def _Determine_endpoint_update_async(
        self, query: str, chat_history: List[Dict]
    ) -> Dict:
        logger.debug(f"Preprocessing query: {query}")

        def normalize_params(params):
            """
            Chuyển đổi params từ mảng các { param, value } hoặc mảng chứa object
            thành một object { key: value }. Xử lý trường hợp đặc biệt với các trường bổ sung.
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
                    # Bỏ qua trường 'param' và 'value', lấy các trường khác (như PostId)
                    if key not in ["param", "value"]:
                        result[key] = None if value == "null" else value
                    # Nếu có 'param' và 'value', ưu tiên giá trị từ 'value' nếu không có trường khác
                    elif (
                        key == "param"
                        and "value" in params[0]
                        and params[0]["value"] != "null"
                    ):
                        result[params[0]["param"]] = (
                            None if params[0]["value"] == "null" else params[0]["value"]
                        )
                return result

            # Trường hợp params là mảng các { param, value }
            if isinstance(params, list):
                result = {}
                for item in params:
                    if isinstance(item, dict):
                        # Xử lý trường hợp có 'param' và 'value'
                        if "param" in item and "value" in item:
                            if item["value"] != "null":
                                result[item["param"]] = (
                                    None if item["value"] == "null" else item["value"]
                                )
                        # Xử lý các trường khác (như PostId)
                        for key, value in item.items():
                            if key not in ["param", "value"]:
                                result[key] = None if value == "null" else value
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

        preprocess_prompt = PromptTemplate(
            input_variables=["query", "chat_history", "base_url"],
            template="""
            Bạn là trợ lý AI thông minh, có nhiệm vụ phân tích câu hỏi của người dùng để xác định:
            1. **Thông tin tham số**: Các giá trị cụ thể mà người dùng cung cấp để điền vào tham số của endpoint (như nội dung bài đăng, phạm vi bài đăng, ID người dùng, v.v.).
            2. **Thông tin truy vấn**: Phần câu hỏi yêu cầu truy vấn cơ sở dữ liệu (như "bài đăng mới nhất", "thông tin của tôi", "bình luận của tôi trên bài đăng X").
            
            ---
            ### Current Query:
            {query}

            ### Ngữ cảnh trước đó:
            {chat_history}
            
            --Mô tả dự án của tôi
            Trang web được thiết kế để tạo ra một nền tảng giao tiếp và chia sẻ thông tin giữa các sinh viên đại học—một mạng xã hội dành riêng cho sinh viên. Nền tảng này có thể phục vụ nhiều mục đích, chẳng hạn như:
            Chia sẻ thông tin về phương tiện đi lại: Sinh viên có thể đăng thông báo về việc đi lại từ điểm A đến điểm B để tìm bạn đi chung xe, giúp tiết kiệm chi phí và tăng cường kết nối.
            Chia sẻ tài liệu học tập: Sinh viên có tài liệu học tập còn thừa sau khi hoàn thành khóa học có thể bán hoặc chia sẻ chúng với những người khác có nhu cầu.
            Đăng, bình luận, thích và chia sẻ: Tương tự như cách thức hoạt động của mạng xã hôi.
            Nhắn tin và trò chuyện: Cho phép sinh viên giao tiếp với nhau giống như mạng xã hôi.
            --Các Endpoint của BE liên quan đến UPDATE kèm tham số cần thiết:
             - EndPoint liên quan đến hủy thích 1 bài đăng như mạng xã hôi:
             -{base_url}/api/Like/like
            Giải thích: Endpoint này dùng để hủy 1 thích trong 1 bài đăng như mạng xã hôi (Like).
            Các tham số cần thiết từ BE(params):
            "PostId":không được phép null
            - EndPoint liên quan đến xóa đăng bài như mạng xã hôi:
            -{base_url}/api/Post/delete
            Giải thích: Endpoint này dùng để xóa 1 bài đăng như mạng xã hôi.
            Các tham số cần thiết từ BE(params):
            "PostId":không được phép null
            - EndPoint liên quan đến xóa bình luận 1 bài đăng như mạng xã hôi:
            -{base_url}/api/Comment/DeleteComment/{{CommentId}}
            Giải thích: Endpoint này dùng để xóa 1 bình luận của người dùng.
            Các tham số cần thiết từ BE(params):
            "CommentId":không được phép null
            **CHÚ Ý**:
            * Nếu trong {query} có dữ liệu nào liên quan đến params thì bỏ dữ liệu đó vào `"params":["param":"<Dữ liệu từ người dùng>", ...]`.
            * Nếu không có thì "params":["param":"<null or not null>", ...]
            * Sử dụng kỹ lịch sử chat {chat_history} để tìm kiếm các thông tin cho các param **Lưu ý là phải tìm thật đúng**,nếu tìm không thấy hoặc không chắc chắn thì bỏ qua. 
            * Loại bỏ chữ "Query mới:" nếu có trong {query}
            * Ý nghĩa của các trường dữ liệu trong {{chat_history}}:
            * Các trường đã có dữ liệu trước đó: tức là các param đã có sẵn các giá trị.
            * Các trường còn thiếu dữ liệu**: tức là những trường cần bổ xung dữ liệu.
            * Endpoint yêu cầu**: Endpoint đã xác định trước đó.
            * Ngữ cảnh trước đó**: Câu hỏi của LLM để yêu cầu người dùng cung cấp thêm dữ liệu còn thiếu.
            * Kết hợp với "Query mới:" tức là dữ liệu được người dùng cung cấp hoặc nếu không phải dữ liệu mà các {{params}} cần thì bỏ qua.
            **Trả về định dạng json như sau**
            {{
                "query": "{query}",
                "endpoint": "<endpoint>",
                "params": {{ "<param_name>": "<null or data from user query>" }},
                "query_for_sql": "<phần câu hỏi cần truy vấn hoặc rỗng>",
                "missing_fields": ["<các tham số chưa có dữ liệu chỉ các trường not null>", ...]
            }}
            * Với `query_for_sql` luôn thêm từ sở hữu "của tôi" vào để câu mang ý nghĩa là người dùng đang cung cấp thông tin của chính họ.
            ví dụ: `query`:"tôi muốn sửa post với nội dung xin chao ae".
            JSON:
            {{
                "query":người dùng muốn xóa post với nội dung xin chao ae,
                "endpoint":"https://localhost:7053/api/Post/update-post",
                "params": {{ "PostId": null }},
                "query_for_sql": "post với nội dung xin chao ae",
                "missing_fields":['PostId']
            }}
            ví dụ nếu lịch sử chat hợp lý:
            JSON:
            {{
                "query":"Bài đăng mới nhất",
                "endpoint":"https://localhost:7053/api/Post/update-post",
                "params": {{'PostId': 'null']}},
                "query_for_sql": "Bài đăng mới nhất của tôi",
                "missing_fields":["PostId"]
            }}
            **Ví dụ chi tiết:**
            Ví dụ chi tiết:
            Hủy thích bài đăng
            Câu hỏi: "Hủy thích bài đăng"
            Đầu ra: {{
                "query": "Hủy thích bài đăng",
                "endpoint": "{base_url}/api/Like/like",
                "params": {{"PostId": "null"}},
                "query_for_sql": "",
                "missing_fields": ["PostId"]
                }}
            Câu hỏi: "Hủy thích bài đăng mới nhất của tôi"
            Đầu ra: {{ "query": "Hủy thích bài đăng mới nhất của tôi", 
            "endpoint": "{base_url}/api/Like/like", "params": {{"PostId": "null"}},
            "query_for_sql": "bài đăng mới nhất của tôi",
            "missing_fields": ["PostId"] }}
            Xóa bài đăng
            Câu hỏi: "Xóa bài đăng của tôi với nội dung "xin chào ae""
            Đầu ra: {{
                "query": "Xóa bài đăng của tôi với nội dung "xin chào ae"",
                "endpoint": "{base_url}/api/Post/delete",
                "params": {{"PostId": "null"}},
                "query_for_sql": "bài đăng của tôi với nội dung "xin chào ae"",
                "missing_fields": ["PostId"] 
                }}
            Câu hỏi: "Xóa bài đăng mới nhất của tôi"
            Đầu ra: {{ "query": "Xóa bài đăng mới nhất của tôi",
            "endpoint": "{base_url}/api/Post/delete",
            "params": {{"PostId": "not null"}}, 
            "query_for_sql": "bài đăng mới nhất của tôi",
            "missing_fields": ["PostId"] }}
            Câu hỏi (có lịch sử chat):
            Lịch sử chat: "Bạn muốn xóa bài đăng nào?" → Người dùng trả lời: "Bài đăng với nội dung "abc""
            Đầu ra: {{ "query": "Bài đăng với nội dung "abc"",
            "endpoint": "{base_url}/api/Post/delete", 
            "params": {{"PostId": "null"}},
            "query_for_sql": "bài đăng của tôi với nội dung "abc"", 
            "missing_fields": ["PostId"] }}
            Xóa bình luận
            Câu hỏi: "Xóa bình luận đầu tiên của tôi trong bài đăng mới nhất của bạn tôi tên là Lê Văn Bún"
            Đầu ra: {{ "query": "Xóa bình luận đầu tiên của tôi trong bài đăng mới nhất của bạn tôi tên là Lê Văn Bún",
            "endpoint": "{base_url}/api/Comment/DeleteComment/{{CommentId}}", 
            "params": {{"CommentId": "null"}}, 
            "query_for_sql": "bình luận đầu tiên của tôi trong bài đăng mới nhất của bạn tôi tên là Lê Văn Bún",
            "missing_fields": ["CommentId"] }}
            Câu hỏi: "Xóa bình luận của tôi trong bài đăng mới nhất"
            Đầu ra: {{ "query": "Xóa bình luận của tôi trong bài đăng mới nhất", 
            "endpoint": "{base_url}/api/Comment/DeleteComment/{{CommentId}}",
            "params": {{"CommentId": "not null"}}, 
            "query_for_sql": "bình luận của tôi trong bài đăng mới nhất của tôi", 
            "missing_fields": ["CommentId"] }}
            Câu hỏi (có lịch sử chat):
            Lịch sử chat: "Bạn muốn xóa bình luận nào?" → Người dùng trả lời: "Bình luận với ID 654"
            Đầu ra: {{ "query": "Bình luận với ID 654", "endpoint": "{base_url}/api/Comment/DeleteComment/654", "params": ["CommentId": "654"], "query_for_sql": "bình luận của tôi với ID 654", "missing_fields": [] }}
                        **Lưu ý**:Nếu không xác định được endpoint nào thì trả về Json như sau:
            {{
                "query":{query},
                "endpoint":"null",
                "params":{{}},
                "query_for_sql": "",
                "missing_fields":[]
            }}
            """,
        )

        try:
            # Format chat_history cho prompt
            formatted_history = json.dumps(chat_history, ensure_ascii=False, indent=2)

            # Gọi LLM để xử lý
            chain = preprocess_prompt | self.sql_llm
            result = await chain.ainvoke(
                {
                    "query": query,
                    "chat_history": formatted_history,
                    "base_url": self.base_url,
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
            logger.info(f"Generated SQL: {sql}, Params: {params}")
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

    async def generate_answer_delete_stream_async(
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
            if history_length > 0:
                last_item = await self.redis.lindex(state_key, -1)  # Lấy item cuối cùng
                try:
                    state = json.loads(last_item)
                    if isinstance(state, dict) and "chat_history" in state:
                        chat_history = state["chat_history"]
                        params = state.get("params", {})
                        missing_fields = state.get("missing_fields", [])
                        endpoint = state.get("endpoint", "")
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
            results_detemine_endpoint = await self._Determine_endpoint_update_async(
                query, chat_history
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
        """Streams the response from the LLM, using table_configs to guide column display."""
        full_response_for_logging = ""
        template = """
        ** Bạn là một trợ lý AI thân thiện trên một mạng xã hội dành cho sinh viên đại học, có nhiệm vụ yêu cầu người dùng cung cấp thông tin còn thiếu một cách tự nhiên và dễ hiểu. Thay vì dùng các thuật ngữ kỹ thuật như "PostId" hay "CommentId", hãy chuyển các tham số còn thiếu thành ngôn ngữ đời thường mà sinh viên dễ hiểu, ví dụ: "bài đăng nào", "bình luận nào", "bài đăng mới nhất", "bài đăng vào lúc mấy giờ" hoặc "bài đăng với nội dung gì".

Mô tả dự án: Nền tảng là một mạng xã hội dành cho sinh viên đại học, hỗ trợ:
Đăng bài, bình luận, thích và chia sẻ.
Gửi yêu cầu kết bạn và nhắn tin.
Câu hỏi của người dùng: {question}
Các tham số còn thiếu: {context}
Các Endpoint có sẵn và Tham số: --Các Endpoint của BE liên quan đến DELETE kèm tham số cần thiết:
Endpoint liên quan đến hủy thích 1 bài đăng:
{base_url}/api/Like/like Giải thích: Endpoint này dùng để hủy thích một bài đăng. Các tham số cần thiết từ BE (params):
"PostId": không được phép null
Endpoint liên quan đến xóa bài đăng:
{base_url}/api/Post/delete Giải thích: Endpoint này dùng để xóa một bài đăng. Các tham số cần thiết từ BE (params):
"PostId": không được phép null
Endpoint liên quan đến xóa bình luận:
{base_url}/api/Comment/DeleteComment/{{CommentId}} Giải thích: Endpoint này dùng để xóa một bình luận của người dùng. Các tham số cần thiết từ BE (params):
"CommentId": không được phép null
Nhiệm vụ:
Phân tích question và context (danh sách các tham số còn thiếu, ví dụ: ["PostId", "CommentId"]).
Chuyển các tham số còn thiếu trong context thành ngôn ngữ tự nhiên, phù hợp với ngữ cảnh của endpoint.
Tạo một câu trả lời thân thiện, mang tính trò chuyện, yêu cầu người dùng cung cấp thông tin còn thiếu.
Không nhắc đến các thuật ngữ kỹ thuật như "PostId", "CommentId", "endpoint" hay "tham số". Thay vào đó, dùng các cụm từ như "bài đăng nào", "bình luận nào", "bài đăng mới nhất", "bài đăng vào lúc mấy giờ" hoặc "bài đăng với nội dung gì".
Nếu câu hỏi ngụ ý một hành động cụ thể (ví dụ: hủy thích, xóa bài đăng, xóa bình luận), hãy điều chỉnh câu trả lời phù hợp với hành động đó.
Không hỏi trực tiếp về ID. Thay vào đó, hỏi theo cách tự nhiên như: "Bài đăng nào?", "Bài đăng mới nhất à?", "Bình luận bạn đăng lúc mấy giờ?" hoặc "Bình luận với nội dung gì?".
Quy tắc:
Sử dụng giọng điệu ấm áp, thân thiện như trò chuyện với bạn bè.
Đối với mỗi tham số còn thiếu, đưa ra một câu hỏi rõ ràng, cụ thể.
Nếu thiếu nhiều tham số, liệt kê chúng một cách tự nhiên (ví dụ: "Mình cần biết bạn muốn xóa bài đăng nào và bình luận nào trong bài đó").
Tránh trả lời chung chung. Đảm bảo câu trả lời liên quan đến câu hỏi và hành động của người dùng.
Chuyển đổi tham số sang ngôn ngữ tự nhiên:
PostId: "Bài đăng nào", "bài đăng mới nhất", "bài đăng bạn đăng lúc mấy giờ", "bài đăng với nội dung gì".
CommentId: "Bình luận nào", "bình luận bạn đăng lúc mấy giờ", "bình luận với nội dung gì", "bình luận trong bài đăng nào".
Định dạng đầu ra: Một câu trả lời bằng ngôn ngữ tự nhiên (văn bản thuần túy) yêu cầu cung cấp thông tin còn thiếu.
Ví dụ:
Câu hỏi: "Hủy thích bài đăng của tôi" Tham số thiếu: ["PostId"] Đầu ra: "Hì, bạn muốn hủy thích bài đăng nào thế? Bài đăng mới nhất hay bài đăng nào khác, như bài bạn đăng hôm qua chẳng hạn? + icon thân thiện"
Câu hỏi: "Xóa bài đăng" Tham số thiếu: ["PostId"] Đầu ra: "Oke, bạn muốn xóa bài đăng nào nè? Bài đăng mới nhất, hay bài đăng có nội dung gì cụ thể? 😄"
Câu hỏi: "Xóa bình luận của tôi" Tham số thiếu: ["CommentId"] Đầu ra: "Được thôi! Bạn muốn xóa bình luận nào? Bình luận trong bài đăng nào, hoặc bình luận bạn viết gì ấy? 😊"
Câu hỏi: "Hủy thích bài đăng mới nhất" Tham số thiếu: ["PostId"] Đầu ra: "Oke, bạn muốn hủy thích bài đăng mới nhất đúng không? Có cần xác nhận thêm không, như bài đăng lúc mấy giờ ấy? + icon thân thiện"
Câu hỏi: "Xóa bình luận trong bài đăng hôm qua" Tham số thiếu: ["CommentId"] Đầu ra: "Hiểu rồi! Bạn muốn xóa bình luận nào trong bài đăng hôm qua? Bình luận bạn viết gì, hoặc đăng lúc mấy giờ nhỉ? 😊"
Câu hỏi: "Xóa bình luận mà tôi đã bình luận vào bài đăng của bạn tôi" Tham số thiếu: ["CommentId"] Đầu ra: "Hiểu rồi! Tôi muốn thêm thông tin bài post mà bạn của bạn đã đăng,hoặc thông tin của bạn đó,ví dụ như tên của họ chẳng hạn? Bình luận bạn viết gì, hoặc đăng lúc mấy giờ nhỉ? + icon thân thiện "
Sử dụng tiếng Việt để trả lời
**Trả lời: **
        """
        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=template.strip(),
        )
        chain = prompt | self.llm

        response_stream = chain.astream(
            {"question": query, "context": json.dumps(params, ensure_ascii=False)}
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
            yield "Sorry, something went wrong while generating the response."

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
