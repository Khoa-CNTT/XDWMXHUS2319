import os
import glob
from langchain_huggingface import HuggingFaceEmbeddings
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class EmbeddingManager:
    _embeddings = None
    # MODEL_REPO = "keepitreal/vietnamese-sBERT"
    # CACHE_BASE = os.path.expanduser("~/.cache/huggingface/hub/models--keepitreal--vietnamese-sBERT/snapshots")

    # @classmethod
    # def get_embeddings(cls) -> HuggingFaceEmbeddings:
    #     """Load or return cached embeddings."""
    #     if cls._embeddings:
    #         logger.debug("Returning cached Vietnamese-sBERT embeddings")
    #         return cls._embeddings

    #     try:
    #         snapshot_dirs = glob.glob(os.path.join(cls.CACHE_BASE, "*"))
    #         model_path = snapshot_dirs[0] if snapshot_dirs else cls.MODEL_REPO
    #         logger.info(f"Loading embeddings from: {model_path}")

    #         cls._embeddings = HuggingFaceEmbeddings(
    #             model_name=model_path,
    #             model_kwargs={"device": "cuda"}  # Use GPU if available
    #         )
    #         logger.info("Vietnamese-sBERT embeddings loaded successfully")
    #         return cls._embeddings
    #     except Exception as e:
    #         logger.error(f"Failed to load embeddings: {str(e)}", exc_info=True)
    #         raise
