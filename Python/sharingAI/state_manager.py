import asyncio
import json
from typing import Dict, List, Optional
from datetime import datetime
from redis.asyncio import Redis
import logging

logger = logging.getLogger(__name__)


async def load_conversation_state(
    state_key: str, redis: Redis, max_retries: int = 3
) -> Dict:
    """Tải trạng thái hội thoại từ Redis với cơ chế retry."""
    for attempt in range(max_retries):
        try:
            state = await redis.get(state_key)
            return (
                json.loads(state)
                if state
                else {
                    "history_for_llm": [],
                    "collected_params": {},
                    "current_intent": None,
                    "required_params_for_intent": [],
                    "api_details_for_fe": {},
                    "last_llm_question": None,
                    "last_llm_answer": None,
                    "last_search_results_context": None,
                }
            )
        except Exception as e:
            logger.error(
                f"Lỗi khi tải state, thử lại {attempt + 1}/{max_retries}: {str(e)}"
            )
            if attempt == max_retries - 1:
                logger.error("Không thể kết nối Redis, trả về state rỗng")
                return {
                    "history_for_llm": [],
                    "collected_params": {},
                    "current_intent": None,
                    "required_params_for_intent": [],
                    "api_details_for_fe": {},
                    "last_llm_question": None,
                    "last_llm_answer": None,
                    "last_search_results_context": None,
                }
            await asyncio.sleep(1)


async def update_state_after_intent_analysis(
    current_state: Dict, intent_analysis_result: Dict, user_query: str
) -> Dict:
    """Cập nhật trạng thái hội thoại sau khi phân tích ý định."""
    from intent_config import get_intent_config

    # Thêm query vào lịch sử
    current_state["history_for_llm"].append({"role": "user", "content": user_query})

    # Giới hạn độ dài lịch sử
    max_history_length = 10
    current_state["history_for_llm"] = current_state["history_for_llm"][
        -max_history_length:
    ]

    # Xử lý intent mới
    identified_intent = intent_analysis_result.get("identified_intent")
    if intent_analysis_result.get("action_type") in [
        "INITIATE_ACTION"
    ] or identified_intent != current_state.get("current_intent"):
        intent_config = get_intent_config(identified_intent)
        if intent_config:
            current_state["current_intent"] = identified_intent
            current_state["required_params_for_intent"] = intent_config[
                "required_params"
            ]
            current_state["api_details_for_fe"] = intent_config["api_details"]
            current_state["collected_params"] = {}
            current_state["last_llm_question"] = None
            current_state["last_llm_answer"] = None

    # Gộp entities vào collected_params
    entities = intent_analysis_result.get("identified_entities", {})
    current_state["collected_params"].update(entities)

    # Cập nhật context nếu có
    if intent_analysis_result.get("target_object_context_from_analysis"):
        current_state["last_search_results_context"] = intent_analysis_result[
            "target_object_context_from_analysis"
        ]

    return current_state


async def save_conversation_state(
    state_key: str, state: Dict, redis: Redis, ttl: int = 3600
):
    """Lưu trạng thái hội thoại vào Redis."""
    try:
        await redis.set(state_key, json.dumps(state, default=str), ex=ttl)
    except Exception as e:
        logger.error(f"Lỗi khi lưu state vào Redis: {str(e)}")
