from asyncio.log import logger
import uuid
from data_loader import DataLoader
from config import FE_API_URL


class URLHandler:
    def __init__(self, data_loader: DataLoader):
        self.data_loader = data_loader
        self.base_url = FE_API_URL
        # Ánh xạ endpoint linh hoạt với fallback
        self.endpoint_config = {
            "default": "/home",
            "mappings": {
                "Posts": "/post/{id}",
                "RidePosts": "/sharing-ride",
                "Users": "/profile/{id}",
                "Rides": "/your-ride",
                "Notifications": "/notify",
                "Reports": "/home",
                "RideReports": "/home",
                "Friendships": {
                    "UserId": "/profile/{id}",
                    "FriendId": "/profile/{id}",
                },
            },
            "base_url": FE_API_URL,
            "always_use_url_for": ["Id", "PostId", "UserId", "RideId"],
            "never_use_url_for": ["PasswordHash", "Email"],
        }

    def should_use_url(self, field_name: str, table: str, question: str) -> bool:
        """Quyết định có nên thay thế bằng URL không"""
        # Không bao giờ dùng URL cho trường nhạy cảm
        if field_name in self.endpoint_config["never_use_url_for"]:
            logger.info(
                f"Field '{field_name}' in table '{table}' is in never_use_url_for, skipping URL"
            )
            return False

        # Luôn dùng URL cho các trường quan trọng
        if field_name in self.endpoint_config["always_use_url_for"]:
            logger.info(
                f"Field '{field_name}' in table '{table}' is in always_use_url_for, using URL"
            )
            return True

        # Kiểm tra ngữ cảnh câu hỏi
        question_lower = question.lower()
        context_keywords = ["chi tiết", "thông tin", "xem", "link", "đường dẫn"]
        if any(keyword in question_lower for keyword in context_keywords):
            logger.info(
                f"Question '{question}' contains context keywords, using URL for '{field_name}' in '{table}'"
            )
            return True

        # Dùng URL cho các bảng quan trọng
        important_tables = ["Posts", "Users", "Rides"]
        if table in important_tables:
            logger.info(
                f"Table '{table}' is in important_tables, using URL for '{field_name}'"
            )
            return True

        logger.info(f"No conditions met for using URL for '{field_name}' in '{table}'")
        return False

    def generate_url(self, table: str, field_name: str, value: str) -> str:
        """Tạo URL từ cấu hình"""
        # Lấy template phù hợp
        template = self.endpoint_config["mappings"].get(
            table, self.endpoint_config["default"]
        )

        # Xử lý trường hợp mapping phức tạp (như Friendships)
        if isinstance(template, dict):
            template = template.get(field_name, self.endpoint_config["default"])

        # Thay thế placeholder
        entity = table[:-1] if table.endswith("s") else table
        url_path = template.format(entity=entity, id=value, table=table)

        # Thêm base URL
        url = f"{self.base_url}{url_path}"
        logger.info(f"Generated URL for '{field_name}' in '{table}': {url}")
        return url

    def process_record(self, record: dict, table: str, question: str) -> dict:
        processed = record.copy()
        table_config = self.data_loader.table_config.get(table, {})
        id_field = table_config.get("id_field", "Id")
        user_id_fields = table_config.get("user_id_fields", []) or []

        allowed_tables = [
            "Posts",
            "RidePosts",
            "Users",
            "Rides",
            "Notifications",
            "Reports",
            "RideReports",
        ]

        logger.info(
            f"Processing record for table {table}, id_field={id_field}, record={record}"
        )
        if (
            table in allowed_tables
            and id_field in processed
            and isinstance(processed[id_field], (str, uuid.UUID))
        ):
            if self.should_use_url(id_field, table, question):
                processed[f"{id_field}Url"] = self.generate_url(
                    table, id_field, str(processed[id_field])
                )
                logger.info(
                    f"Generated URL for {id_field} in table {table}: {processed[f'{id_field}Url']}"
                )
            else:
                logger.info(
                    f"should_use_url returned False for {id_field} in table {table}"
                )

        for field in user_id_fields + ["PostId", "RideId", "FriendId"]:
            if (
                field in processed
                and isinstance(processed[field], (str, uuid.UUID))
                and self.should_use_url(field, table, question)
            ):
                target_table = None
                if field == "PostId":
                    target_table = "Posts"
                elif field == "RideId":
                    target_table = "Rides"
                elif field in [
                    "UserId",
                    "FriendId",
                    "SenderId",
                    "ReceiverId",
                    "PassengerId",
                    "DriverId",
                    "RatedByUserId",
                ]:
                    target_table = "Users"
                if target_table in allowed_tables:
                    processed[f"{field}Url"] = self.generate_url(
                        target_table, field, str(processed[field])
                    )
                    logger.info(
                        f"Generated URL for {field} in table {target_table}: {processed[f'{field}Url']}"
                    )

        return processed
