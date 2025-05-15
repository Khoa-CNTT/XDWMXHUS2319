import asyncio
from typing import List, Optional
from answer_generator import AnswerGenerator
from vector_store import VectorStore
from data_loader import DataLoader
from create_service import CreateQueryProcessor
from public_service import PublicQueryProcessor


async def test_generate_sql_query():
    vector_store = VectorStore()
    data_loader = DataLoader()
    ans = AnswerGenerator()
    cs = CreateQueryProcessor()
    public_service = PublicQueryProcessor()

    query = "bây giờ là mấy giờ theo giờ việt nam"
    role = "user"
    user_id = "CFA82DCE-5902-4419-A6A1-3D8066BAD303"
    relevant_tables = ["Posts"]
    ids: Optional[List[str]] = None
    response_chunks = []

    async for chunk in public_service._stream_response(question=query, chat_history=[]):
        response_chunks.append(chunk)
        print({"type": "chunk", "content": chunk})

    # Gộp response cho chunk final
    full_response = "".join(response_chunks)
    print("Full response:", full_response)


if __name__ == "__main__":
    asyncio.run(test_generate_sql_query())
