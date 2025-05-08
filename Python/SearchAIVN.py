import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
import uvicorn
import logging
from typing import List
import os

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Student Data Search API")

# Đường dẫn lưu trữ ChromaDB
CHROMA_DATA_PATH = r"E:\DOANTOTNGHIEP\Code\DataChromadb"

# Tạo thư mục nếu chưa tồn tại
if not os.path.exists(CHROMA_DATA_PATH):
    os.makedirs(CHROMA_DATA_PATH)
    logger.info(f"Created directory: {CHROMA_DATA_PATH}")
else:
    logger.info(f"Directory already exists: {CHROMA_DATA_PATH}")

# Khởi tạo model và ChromaDB với persistence
model = SentenceTransformer("keepitreal/vietnamese-sbert")
chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
collection = chroma_client.get_or_create_collection("student_data")
logger.info("Initialized SentenceTransformer and ChromaDB with persistence")

# Định nghĩa các model Pydantic
class EmbedRequest(BaseModel):
    text: str

class StoreItem(BaseModel):
    id: str
    embedding: List[float]
    type: str
    content: str

class StoreRequest(BaseModel):
    items: List[StoreItem]

class SearchRequest(BaseModel):
    query_embedding: List[float]
    query_type: str
    top_k: int = 5

# Endpoint tạo embedding
@app.post("/embed")
async def embed_text(request: EmbedRequest):
    try:
        embedding = model.encode(request.text, normalize_embeddings=True).tolist()
        return {"embedding": embedding, "embedding_length": len(embedding)}
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")
@app.delete("/clear-data")
async def clear_data():
    chroma_client.delete_collection("student_data")
    collection = chroma_client.get_or_create_collection("student_data")
    logger.info("Cleared all data in ChromaDB")
    return {"message": "All data cleared"}
# Endpoint lưu vào ChromaDB
@app.post("/store")
async def store_vector(request: StoreRequest):
    try:
        if not request.items:
            raise HTTPException(status_code=400, detail="No items provided")
        
        ids = [item.id for item in request.items]
        embeddings = [item.embedding for item in request.items]
        documents = [item.content for item in request.items]
        metadatas = [{"type": item.type, "last_updated": datetime.datetime.now().isoformat()} for item in request.items]
        
        collection.upsert(
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"Stored {len(ids)} vectors in ChromaDB: {', '.join(ids)}")
        return {"message": f"Stored {len(ids)} vectors in ChromaDB"}
    except Exception as e:
        logger.error(f"Error storing vectors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store vectors: {str(e)}")
# Endpoint tìm kiếm
@app.post("/search")
async def search(request: SearchRequest):
    try:
        results = collection.query(
            query_embeddings=[request.query_embedding],
            n_results=request.top_k,
            where={"type": request.query_type},
            include=["documents", "metadatas", "distances"]
        )
        if not results["ids"] or not results["ids"][0]:
            return {"results": []}
        search_results = [
            {"id": id, "score": 1 - distance, "content": doc, "type": meta["type"]}
            for id, doc, meta, distance in zip(
                results["ids"][0], results["documents"][0], results["metadatas"][0], results["distances"][0]
            )
        ]
        return {"results": search_results}  # Trả về object với field "results"
    except Exception as e:
        logger.error(f"Error searching vectors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search vectors: {str(e)}")

# Endpoint lấy tất cả ID
@app.get("/get-ids")
async def get_ids():
    try:
        results = collection.get(include=[])
        return results["ids"]
    except Exception as e:
        logger.error(f"Error retrieving IDs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve IDs: {str(e)}")

# Endpoint in dữ liệu
@app.get("/dump-data")
async def dump_data():
    try:
        results = collection.get(include=["documents", "metadatas"])
        if not results["ids"]:
            logger.info("No data in ChromaDB")
            return {"message": "No data in ChromaDB", "data": []}
        data = [
            {"id": id, "content": doc, "type": meta["type"]}
            for id, doc, meta in zip(results["ids"], results["documents"], results["metadatas"])
        ]
        logger.info(f"Dumping {len(data)} items from ChromaDB:")
        for item in data:
            logger.info(f"ID: {item['id']}, Type: {item['type']}, Content: {item['content']}")
        return {"message": f"Dumped {len(data)} items from ChromaDB", "data": data}
    except Exception as e:
        logger.error(f"Error dumping data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to dump data: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)