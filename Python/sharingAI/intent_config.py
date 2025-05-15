from typing import Dict, Optional


def get_intent_config(intent: str) -> Optional[Dict]:
    INTENT_CONFIG = {
        "CREATE_POST": {
            "required_params": ["Content", "Scope"],
            "api_details": {
                "endpoint_path": "https://localhost:7053/api/Post/create",
                "method": "POST",
                "param_map_to_api": {"Content": "PostContent", "Scope": "Visibility"},
            },
            "param_prompts": {
                "Content": "Bạn muốn đăng bài với nội dung gì?",
                "Scope": "Ai có thể xem bài đăng này (public hay friends)?",
            },
        },
        "JOIN_RIDE": {
            "required_params": ["RidePostId", "DriverId", "IsSafetyTrackingEnabled"],
            "api_details": {
                "endpoint_path": "https://localhost:7053/api/Ride/create",
                "method": "POST",
                "param_map_to_api": {},
            },
            "param_prompts": {
                "RidePostId": "Bạn muốn tham gia chuyến đi nào? (Chọn số thứ tự)",
                "DriverId": "Ai sẽ lái xe?",
                "IsSafetyTrackingEnabled": "Bạn có muốn bật tính năng theo dõi an toàn không?",
            },
        },
        "CREATE_COMMENT": {
            "required_params": ["PostId", "Content"],
            "api_details": {
                "endpoint_path": "https://localhost:7053/api/Comment/CommentPost",
                "method": "POST",
                "param_map_to_api": {},
            },
            "param_prompts": {
                "PostId": "Bạn muốn bình luận vào bài đăng nào?",
                "Content": "Nội dung bình luận của bạn là gì?",
            },
        },
    }
    return INTENT_CONFIG.get(intent)
