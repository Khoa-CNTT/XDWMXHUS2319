# vector_store.py
import hashlib
import json
import os
from typing import List, Dict, Optional
import numpy as np
import faiss
import redis.asyncio as redis
from langchain_community.vectorstores import FAISS
from langchain_community.docstore import InMemoryDocstore
from langchain_core.documents import Document
from datetime import datetime
import logging
import re

# Giả sử EmbeddingManager là một module tùy chỉnh của bạn
from embedding import EmbeddingManager

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def preprocess_query(query: str) -> str:
    """Preprocess query by normalizing text."""
    query = query.lower()
    query = re.sub(r"[^\w\s]", "", query)
    return query


def convert_numpy_types(obj):
    """Convert numpy types to Python types for JSON serialization."""
    if isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


class VectorStore:
    def __init__(self, index_path: str = "VectorDbForAI"):
        # self.embeddings = EmbeddingManager.get_embeddings()
        # self.index_path = index_path
        # self.dimension = 768  # Vietnamese-sBERT embedding dimension
        # self.redis_client = redis.Redis(host="localhost", port=6379, db=0)
        # self.vectorstore = None
        self.documents = []

    # self._load_index()

    # def _load_index(self) -> None:
    #     """Load existing FAISS index or initialize a new one."""
    #     index_file = os.path.join(self.index_path, "index.faiss")
    #     if os.path.exists(index_file):
    #         try:
    #             self.vectorstore = FAISS.load_local(
    #                 self.index_path,
    #                 self.embeddings,
    #                 allow_dangerous_deserialization=True
    #             )
    #             self.documents = [doc for doc in self.vectorstore.docstore._dict.values()]
    #             logger.info(f"Loaded FAISS index from {self.index_path} with {len(self.documents)} documents")
    #         except Exception as e:
    #             logger.error(f"Failed to load FAISS index: {str(e)}", exc_info=True)
    #             self._initialize_new_index()
    #     else:
    #         logger.debug(f"No FAISS index found at {index_file}, will create on first store")
    #         self._initialize_new_index()

    # def _initialize_new_index(self) -> None:
    #     """Initialize a new FAISS index."""
    #     try:
    #         faiss_index = faiss.IndexHNSWFlat(self.dimension, 32)
    #         self.vectorstore = FAISS(
    #             embedding_function=self.embeddings,
    #             index=faiss_index,
    #             docstore=InMemoryDocstore({}),
    #             index_to_docstore_id={}
    #         )
    #         self.documents = []
    #         logger.info("Initialized new FAISS index")
    #     except Exception as e:
    #         logger.error(f"Failed to initialize FAISS index: {str(e)}", exc_info=True)
    #         raise

    # async def store_data(self, data: List[Dict]) -> None:
    #     """Store documents in the FAISS index and cache in Redis."""
    #     if not data:
    #         logger.warning("No data provided to store")
    #         return

    #     documents = [
    #         Document(
    #             page_content=str(item["content"]),
    #             metadata={
    #                 "id": item["id"],
    #                 "table": item["table"],
    #                 "userId": item.get("userId", ""),
    #                 "scope": item.get("scope", "private"),
    #                 "created_at": datetime.now().isoformat(),
    #                 "last_updated": datetime.now().isoformat(),
    #                 "permissions": item.get("permissions", {})
    #             }
    #         ) for item in data
    #     ]

    #     try:
    #         if self.vectorstore is None:
    #             self.vectorstore = FAISS.from_documents(documents, self.embeddings)
    #         else:
    #             self.vectorstore.add_documents(documents)

    #         self.documents.extend(documents)
    #         os.makedirs(self.index_path, exist_ok=True)
    #         self.vectorstore.save_local(self.index_path)
    #         logger.info(f"Stored {len(documents)} documents in FAISS at {self.index_path}")

    #         # Cache documents in Redis
    #         for doc in documents:
    #             cache_key = f"doc:{doc.metadata['id']}"
    #             await self.redis_client.setex(cache_key, 3600, json.dumps({
    #                 "content": doc.page_content,
    #                 "metadata": doc.metadata
    #             }, default=convert_numpy_types, ensure_ascii=False))
    #     except Exception as e:
    #         logger.error(f"Failed to save FAISS index: {str(e)}", exc_info=True)
    #         raise

    # async def delete_documents(self, ids: List[str]) -> None:
    #     """Delete documents from FAISS by IDs."""
    #     if not self.vectorstore:
    #         logger.warning("FAISS vectorstore not initialized")
    #         return

    #     try:
    #         # Filter out IDs that exist in the FAISS store
    #         valid_ids = [id for id in ids if id in self.vectorstore.docstore._dict]
    #         if not valid_ids:
    #             logger.info("No valid IDs to delete from FAISS")
    #             return

    #         invalid_ids = set(ids) - set(valid_ids)
    #         if invalid_ids:
    #             logger.warning(f"Skipping deletion of non-existent IDs in FAISS: {invalid_ids}")

    #         self.vectorstore.delete(valid_ids)
    #         self.documents = [doc for doc in self.documents if doc.metadata["id"] not in valid_ids]
    #         self.vectorstore.save_local(self.index_path)
    #         logger.info(f"Deleted {len(valid_ids)} documents from FAISS")
    #     except Exception as e:
    #         logger.error(f"Failed to delete documents: {str(e)}", exc_info=True)

    # def _clear_old_data(self, max_docs: int = 500) -> None:
    #     """Clear old documents based on last_updated to keep index size manageable."""
    #     if not self.vectorstore or self.vectorstore.index.ntotal <= max_docs:
    #         return

    #     try:
    #         docs = self.vectorstore.docstore._dict
    #         sorted_docs = sorted(
    #             docs.items(),
    #             key=lambda x: x[1].metadata.get("last_updated", "2000-01-01T00:00:00"),
    #             reverse=True
    #         )
    #         keep_ids = [doc_id for doc_id, _ in sorted_docs[:max_docs]]
    #         keep_docs = [docs[doc_id] for doc_id in keep_ids]
    #         self.vectorstore = FAISS.from_documents(keep_docs, self.embeddings)
    #         self.documents = keep_docs
    #         self.vectorstore.save_local(self.index_path)
    #         logger.info(f"Cleared old FAISS data. Current size: {self.vectorstore.index.ntotal}")
    #     except Exception as e:
    #         logger.error(f"Failed to clear old FAISS data: {str(e)}", exc_info=True)

    # async def search(self, query: str, top_k: int = 5, user_id: Optional[str] = None, role: str = "user", intent: Optional[str] = None) -> List[Dict]:
    #     """Search for similar documents in FAISS."""
    #     if not self.vectorstore:
    #         logger.warning("FAISS vectorstore not initialized")
    #         return []

    #     cache_key = f"search:{hashlib.md5(f'{query}:{user_id}:{role}:{intent}'.encode()).hexdigest()}"
    #     cached_results = await self.redis_client.get(cache_key)
    #     if cached_results:
    #         logger.info(f"Cache hit for search query: {query}")
    #         return json.loads(cached_results)

    #     try:
    #         query_embedding = self.embeddings.embed_query(query)
    #         D, I = self.vectorstore.index.search(np.array([query_embedding], dtype=np.float32), top_k)

    #         filtered_results = []
    #         for i, idx in enumerate(I[0]):
    #             if idx == -1:
    #                 continue
    #             doc = self.documents[idx]
    #             if user_id and doc.metadata.get("userId") != user_id and role != "admin":
    #                 continue
    #             if intent and doc.metadata.get("table") != intent:
    #                 continue
    #             filtered_results.append({
    #                 "content": doc.page_content,
    #                 "id": doc.metadata["id"],
    #                 "table": doc.metadata["table"],
    #                 "userId": doc.metadata["userId"],
    #                 "distance": float(D[0][i])
    #             })

    #         if filtered_results:
    #             await self.redis_client.setex(
    #                 cache_key, 300, json.dumps(filtered_results, default=convert_numpy_types, ensure_ascii=False)
    #             )
    #             logger.info(f"Cached search results for query: {query}")

    #         return filtered_results
    #     except Exception as e:
    #         logger.error(f"Search failed: {str(e)}", exc_info=True)
    #         return []

    # def as_retriever(self, search_kwargs: dict = None):
    #     """Return the vectorstore as a retriever."""
    #     if not self.vectorstore:
    #         logger.warning("No FAISS index loaded")
    #         return None
    #     search_kwargs = search_kwargs or {"k": 20}
    #     return self.vectorstore.as_retriever(search_kwargs=search_kwargs)

    # def find_similar_query(self, query: str, user_queries: List[Dict], threshold: float = 0.85) -> Optional[Dict]:
    #     """Find similar query in user queries."""
    #     query_embedding = self.embeddings.embed_query(query)
    #     for user_query in user_queries:
    #         similarity = np.dot(query_embedding, user_query["embedding"]) / (
    #             np.linalg.norm(query_embedding) * np.linalg.norm(user_query["embedding"])
    #         )
    #         if similarity > threshold:
    #             logger.info(f"Found similar query: {user_query['query']}... with similarity {similarity}")
    #             return user_query
    #     return None
