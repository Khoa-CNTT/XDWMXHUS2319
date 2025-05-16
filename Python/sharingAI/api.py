# api.py
from datetime import datetime
from decimal import Decimal
import decimal
import json
import logging
import re
import uuid
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
import orjson
from pydantic import BaseModel
from contextlib import asynccontextmanager
import psutil
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
import httpx
from redis import asyncio as aioredis
from data_loader import DataLoader
from vector_store import VectorStore
from answer_generator import AnswerGenerator
from config import SQL_SERVER_CONNECTION, JWT_SECRET_KEY, GOOGLE_API_KEY_LLM
from typing import AsyncIterator, List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from create_service import CreateQueryProcessor
from update_service import UpdateQueryProcessor
from delete_service import DeleteQueryProcessor
from public_service import PublicQueryProcessor
from state_manager import (
    load_conversation_state,
    update_state_after_intent_analysis,
    save_conversation_state,
)

redis = None
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Global instances
data_loader = None
vector_store = None
answer_generator = None
llm = None


def default_encoder(obj):
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
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate and decode JWT token to get user information."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"],
            audience="https://Sharing.com",
            options={
                "verify_iss": True,
                "verify_aud": True,
                "verify_exp": True,
                "iss": "SharingSystem",
            },
        )
        user_id = payload.get(
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        )
        role = payload.get(
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        )
        if not user_id or not role:
            raise HTTPException(
                status_code=401, detail="Invalid token: Missing user_id or role"
            )
        return {"user_id": user_id, "role": role}
    except ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError as e:
        logger.error(f"Invalid token error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


class QueryRequest(BaseModel):
    query: str
    user_id: str
    conversation_id: str | None = None
    role: str | None = None
    accessToken: str | None = None
    stream_id: str | None = None


class UpdatePostRequest(BaseModel):
    post_id: str
    content: str
    scope: int | None = None
    is_delete_image: bool = False
    is_delete_video: bool = False


class ApproveSQLRequest(BaseModel):
    sql_id: str
    rating: int
    is_approved: bool


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize global resources on startup and clean up on shutdown."""
    global data_loader, vector_store, answer_generator, llm, create_service, update_service, delete_service, public_service, redis
    logger.info("Starting application")
    try:
        data_loader = DataLoader(SQL_SERVER_CONNECTION)
        vector_store = VectorStore()
        answer_generator = AnswerGenerator()
        create_service = CreateQueryProcessor()
        update_service = UpdateQueryProcessor()
        delete_service = DeleteQueryProcessor()
        public_service = PublicQueryProcessor()
        redis = aioredis.from_url(
            "redis://localhost", decode_responses=False
        )  # hoặc True nếu muốn auto decode bytes

        logger.info("Initialized DataLoader, VectorStore")
    except Exception as e:
        logger.error(f"Lifespan error: {str(e)}", exc_info=True)
        raise
    yield
    logger.info("Shutting down application")


app = FastAPI(lifespan=lifespan)


async def count_tokens(text: str) -> int:
    """Count tokens using Gemini API (placeholder)."""
    return len(text.split())


@app.post("/api/query")
async def query(request: QueryRequest, current_user: dict = Depends(get_current_user)):
    logger.info(f"Đang xử lý truy vấn: {request.query}")
    if request.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="ID người dùng không khớp với JWT")

    conversation_id = request.conversation_id.lower()
    user_id = request.user_id.lower()
    chat_history = await data_loader.load_chat_history_async(conversation_id)
    chat_history_str = json.dumps(
        chat_history, ensure_ascii=False, indent=2, default=default_encoder
    )
    logger.info(f"Lịch sử trò chuyện:\n{chat_history_str}")

    # Kiểm tra Redis trước khi xử lý
    state_key = f"conversation:{conversation_id}:{user_id}"
    cached_action_type = None
    missing_fields = []
    history_length = await redis.llen(state_key)
    if history_length > 0:
        # Lấy phần tử cuối cùng từ danh sách Redis
        cached_state = await redis.lrange(state_key, -1, -1)
        if cached_state:
            try:
                cached_action_type = json.loads(cached_state[0])
                action_type = cached_action_type.get("type", "")
                normalized_query = cached_action_type.get("normalized_query", "")
                relevant_tables = cached_action_type.get("relevant_tables", [])
                missing_fields = cached_action_type.get("missing_fields", [])
                logger.info(f"Tìm thấy loại hành động trong cache: {action_type}")
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Lỗi khi giải mã dữ liệu Redis: {e}")
                cached_action_type = None
    ids = []
    if not history_length:
        # Không tìm thấy cache hoặc lỗi, tiếp tục xử lý
        intent_result = await answer_generator._preprocess_query_async(
            request.query, chat_history_str
        )
        action_type = intent_result["type"]
        relevant_tables = intent_result["relevant_tables"] or []
        normalized_query = intent_result["normalized_query"]
        ids = intent_result["ids"] or []
        alert = intent_result["alert"]

    normalized_chat_history = [
        item
        for item in chat_history
        if isinstance(item, dict) and "role" in item and "content" in item
    ]

    last_5_answers = [
        item["content"]
        for item in reversed(normalized_chat_history)
        if item.get("role") == "assistant"
    ][:5]

    trimmed_chat_history = [
        {"role": "assistant", "content": content}
        for content in reversed(last_5_answers)
    ]

    logger.info(f"Loại hành động: {action_type}")

    async def stream_response() -> AsyncIterator[str]:
        try:
            if action_type == "CREATE":
                generator = create_service.generate_answer_create_stream_async(
                    query=request.query,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    role=current_user["role"],
                    action_type=action_type,
                    relevant_tables=relevant_tables,
                    normalized_query=normalized_query,
                    chat_history=chat_history_str,
                )
            elif action_type == "UPDATE":
                generator = update_service.generate_answer_update_stream_async(
                    query=request.query,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    role=current_user["role"],
                    action_type=action_type,
                    relevant_tables=relevant_tables,
                    normalized_query=normalized_query,
                    chat_history=chat_history_str,
                )
            elif action_type == "DELETE":
                generator = delete_service.generate_answer_delete_stream_async(
                    query=request.query,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    role=current_user["role"],
                    action_type=action_type,
                    relevant_tables=relevant_tables,
                    normalized_query=normalized_query,
                    chat_history=chat_history_str,
                )
            elif action_type == "FALSE":
                response_chunks = []

                async for chunk in public_service._stream_response(
                    question=request.query, chat_history=trimmed_chat_history
                ):
                    response_chunks.append(chunk)
                    yield json.dumps(
                        {"type": "chunk", "content": chunk}, ensure_ascii=False
                    ) + "\n"

                # Gộp response cho chunk final
                full_response = "".join(response_chunks)
                token_count = await count_tokens(
                    full_response
                )  # Sử dụng hàm async đã định nghĩa

                yield json.dumps(
                    {
                        "type": "final",
                        "data": {
                            "normalized_query": normalized_query,
                            "response": full_response,
                            "token_count": token_count,
                            "results": [],  # bạn có thể gán kết quả từ vector search hoặc để [] nếu không có
                            "type": action_type,
                        },
                    },
                    ensure_ascii=False,
                ) + "\n"
            else:

                generator = answer_generator.generate_answer_stream_async(
                    query=request.query,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    role=current_user["role"],
                    chat_history=chat_history,
                    ids=ids,
                    relevant_tables=relevant_tables,
                    normalized_query=normalized_query,
                    action_type=action_type,
                    state_key=state_key,
                )

            async for item in generator:
                yield orjson.dumps(item, default=default_encoder).decode() + "\n"

        except Exception as e:
            logger.error(f"Lỗi khi truyền dữ liệu: {str(e)}", exc_info=True)
            yield json.dumps(
                {"type": "error", "message": str(e)}, ensure_ascii=False
            ) + "\n"

    return StreamingResponse(content=stream_response(), media_type="text/event-stream")
