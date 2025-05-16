import asyncio
from datetime import datetime
from typing import Any, Dict, List
from answer_generator import AnswerGenerator
from vector_store import VectorStore
from data_loader import DataLoader
from update_service import UpdateQueryProcessor


async def test_generate_sql_query():
    vector_store = VectorStore()
    data_loader = DataLoader()
    ans = AnswerGenerator()
    cs = UpdateQueryProcessor()

    query = "cập nhật nội dung bài post mới nhất của tôi thành đảo chúp ahiohi"
    role = "user"
    user_id = "CFA82DCE-5902-4419-A6A1-3D8066BAD303"
    relevant_tables = ["Users"]
    ids = None

    async for item in cs.generate_answer_update_stream_async(
        query=query,
        user_id=user_id,
        conversation_id="3da51dd2-2a8b-4b0b-a03d-4759fd21a763",
        role=role,
        action_type="CREATE",
        relevant_tables=relevant_tables,
        normalized_query=query,
    ):
        print(item)  # In ra kết quả trả về từng phần


if __name__ == "__main__":
    asyncio.run(test_generate_sql_query())
