# data_loader.py
import json
import re
import logging
from string import Template
from typing import List, Dict, Tuple, Optional, Union
from fuzzywuzzy import fuzz
from datetime import datetime
from contextlib import asynccontextmanager
import uuid
import aioodbc
from langchain_google_genai import ChatGoogleGenerativeAI
from config import SQL_SERVER_CONNECTION, GOOGLE_API_KEY_FIX_SQL
import pyodbc
from embedding import EmbeddingManager
from decimal import Decimal
from langchain.prompts import PromptTemplate

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


class DataLoader:
    def __init__(
        self,
        connection_string: str = SQL_SERVER_CONNECTION,
        config_path: str = "table_config.json",
    ):
        self.connection_string = connection_string
        # self.embeddings = EmbeddingManager.get_embeddings()
        self.allowed_tables = set()
        self.table_config = {}
        self.format_templates = self._load_format_templates("format_templates.json")
        self._initialize_table_config(config_path)
        self.sql_llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY_FIX_SQL,
            temperature=0,
            max_output_tokens=2024,
            disable_streaming=True,
        )

    def _load_format_templates(self, format_templates_file: str) -> dict:
        """Load format templates from file and cache them."""
        try:
            with open(format_templates_file, "r", encoding="utf-8") as f:
                templates = json.load(f)
            logger.info(f"Loaded format templates from {format_templates_file}")
            return templates
        except Exception as e:
            logger.warning(
                f"Failed to load format templates: {str(e)}. Generating new templates."
            )
            # generate_format_templates()
            try:
                with open(format_templates_file, "r", encoding="utf-8") as f:
                    templates = json.load(f)
                logger.info(
                    f"Generated and loaded new format templates from {format_templates_file}"
                )
                return templates
            except Exception as e:
                logger.error(f"Failed to generate/load format templates: {str(e)}")
                return {}

    @asynccontextmanager
    async def _connect_async(self):
        """Async context manager for database connections."""
        async with aioodbc.connect(dsn=self.connection_string) as conn:
            yield conn

    # Trong _initialize_table_config
    def _initialize_table_config(self, config_path: str):
        """Build table config by combining database schema and JSON config, using table names as keys."""
        cache_file = "table_config_cache.json"
        format_templates_file = "format_templates.json"

        # 1. Thử load cache nếu có
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                self.table_config = json.load(f)
                # Kiểm tra và cập nhật cấu trúc cache nếu cần
                for table_name, config in self.table_config.items():
                    # Chuyển user_id_field thành mảng nếu cần
                    if "user_id_field" in config and "user_id_fields" not in config:
                        config["user_id_fields"] = (
                            [config["user_id_field"]]
                            if config["user_id_field"]
                            else None
                        )
                        del config["user_id_field"]
                    # Thêm own_columns nếu chưa có
                    if "permissions" in config and "user" in config["permissions"]:
                        if "own_columns" not in config["permissions"]["user"]:
                            config["permissions"]["user"]["own_columns"] = config[
                                "columns"
                            ]
                self.allowed_tables = set(self.table_config.keys())
                logger.info(
                    f"Loaded table config from cache: {list(self.table_config.keys())}"
                )
                # Lưu lại cache sau khi cập nhật
                with open(cache_file, "w", encoding="utf-8") as f:
                    json.dump(
                        self.table_config,
                        f,
                        cls=JSONEncoder,
                        ensure_ascii=False,
                        indent=2,
                    )
                return
        except Exception:
            logger.info("Building table config from database")

        config = {}

        try:
            conn = pyodbc.connect(self.connection_string)
            cursor = conn.cursor()

            # 2. Load JSON config (chỉ lấy excluded_tables)
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    json_config = json.load(f)
                excluded_tables = json_config.get("excluded_tables", [])
                logger.info(
                    f"Loaded excluded_tables from JSON config: {excluded_tables}"
                )
            except Exception as e:
                logger.warning(
                    f"Failed to load JSON config: {str(e)}. Using default excluded_tables."
                )
                excluded_tables = [
                    "sysdiagrams",
                    "AIChatHistories",
                    "QueryCache",
                    "RefreshTokens",
                    "EmailVerificationTokens",
                    "GeneratedSQLs",
                ]

            # 3. Lấy danh sách bảng, bỏ qua các bảng trong excluded_tables
            cursor.execute(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo'"
            )
            table_names = [
                row.TABLE_NAME
                for row in cursor.fetchall()
                if row.TABLE_NAME not in excluded_tables
            ]

            # 4. Với từng bảng
            for table_name in table_names:
                # 4.1. Lấy thông tin cột và constraint
                cursor.execute(
                    """
                    SELECT 
                        COLUMN_NAME, 
                        DATA_TYPE, 
                        IS_NULLABLE,
                        (SELECT CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
                                ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
                                WHERE tc.TABLE_NAME = c.TABLE_NAME 
                                AND ccu.COLUMN_NAME = c.COLUMN_NAME
                                AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                            ) THEN 'PRIMARY KEY'
                            WHEN EXISTS (
                                SELECT 1 
                                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
                                ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
                                WHERE tc.TABLE_NAME = c.TABLE_NAME 
                                AND ccu.COLUMN_NAME = c.COLUMN_NAME
                                AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
                            ) THEN 'FOREIGN KEY'
                            ELSE ''
                        END) AS [constraint]
                    FROM INFORMATION_SCHEMA.COLUMNS c
                    WHERE TABLE_NAME = ?
                """,
                    table_name,
                )

                columns_info = cursor.fetchall()
                columns = [row.COLUMN_NAME for row in columns_info]
                id_field = next(
                    (
                        row.COLUMN_NAME
                        for row in columns_info
                        if row.constraint == "PRIMARY KEY"
                    ),
                    None,
                )
                user_id_fields = [
                    row.COLUMN_NAME
                    for row in columns_info
                    if row.COLUMN_NAME.lower()
                    in [
                        "userid",
                        "senderid",
                        "receiverid",
                        "createdby",
                        "reportedby",
                        "passengerid",
                        "driverid",
                        "user1id",
                        "user2id",
                    ]
                ]

                # 4.2. Bỏ tìm json_table_config vì không cần table_config.json

                # 4.3. Xây dựng filters mặc định
                filters = None
                default_filters = []
                if "IsDeleted" in columns:
                    default_filters.append("IsDeleted = 0")
                if "CreatedAt" in columns:
                    default_filters.append("(CreatedAt IS NOT NULL)")
                if default_filters:
                    filters = " AND ".join(default_filters)

                # 4.4. Xây dựng permission mặc định
                sensitive_columns = {
                    "email",
                    "passwordhash",
                    "token",
                    "phone",
                    "relativephone",
                    "bio",
                }
                user_columns = [
                    col for col in columns if col.lower() not in sensitive_columns
                ]
                own_columns = columns  # own_columns bao gồm tất cả cột của bảng

                if user_id_fields:
                    user_filter = (
                        f"{filters} AND ({' OR '.join(f'{uid} = ?' for uid in user_id_fields)})"
                        if filters
                        else f"({' OR '.join(f'{uid} = ?' for uid in user_id_fields)})"
                    )
                else:
                    user_filter = filters

                permissions = {
                    "user": {
                        "allowed_columns": user_columns,
                        "own_columns": own_columns,
                        "filters": user_filter,
                    },
                    "admin": {"allowed_columns": columns, "filters": None},
                }
                logger.warning(
                    f"No JSON config found for table {table_name}. Using default permissions."
                )

                # 4.5. Thêm vào config với khóa là tên bảng
                config[table_name] = {
                    "table": table_name,
                    "columns": columns,
                    "id_field": id_field or "Id",
                    "user_id_fields": user_id_fields if user_id_fields else None,
                    "filters": filters,
                    "permissions": permissions,
                }

            self.table_config = config
            self.allowed_tables = set(config.keys())

            # 5. Save cache
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(
                    self.table_config, f, cls=JSONEncoder, ensure_ascii=False, indent=2
                )
            logger.info(f"Saved table config to cache: {cache_file}")

            conn.close()

        except Exception as e:
            logger.error(f"Failed to initialize table config: {str(e)}", exc_info=True)
            self.table_config = {}
            self.allowed_tables = set()

    async def get_specific_schemas(
        self, table_list: List[str], role: str = "user"
    ) -> Dict[str, List[Dict[str, str]]]:
        """Retrieve the schema of specified tables based on role."""
        schema = {}
        if not table_list:
            logger.warning("No tables specified for schema retrieval")
            return schema

        # Lọc bảng hợp lệ
        valid_tables = [
            t
            for t in table_list
            if t in [self.table_config[k]["table"] for k in self.table_config]
        ]
        if role == "Admin":
            valid_tables = table_list  # Admin có thể truy cập mọi bảng

        if not valid_tables:
            logger.error(
                f"No valid tables in provided list: {table_list} for role {role}"
            )
            return schema

        try:
            async with self._connect_async() as conn:
                async with conn.cursor() as cursor:
                    placeholders = ",".join(["?"] * len(valid_tables))
                    query = f"""
                        SELECT 
                            c.TABLE_NAME, 
                            c.COLUMN_NAME, 
                            c.DATA_TYPE, 
                            c.IS_NULLABLE,
                            CASE 
                                WHEN EXISTS (
                                    SELECT 1 
                                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                    JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
                                    ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
                                    WHERE tc.TABLE_NAME = c.TABLE_NAME 
                                    AND ccu.COLUMN_NAME = c.COLUMN_NAME
                                    AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                                ) THEN 'PRIMARY KEY'
                                WHEN EXISTS (
                                    SELECT 1 
                                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                    JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
                                    ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
                                    WHERE tc.TABLE_NAME = c.TABLE_NAME 
                                    AND ccu.COLUMN_NAME = c.COLUMN_NAME
                                    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
                                ) THEN 'FOREIGN KEY'
                                ELSE ''
                            END AS [constraint],
                            fk_referenced_table.TABLE_NAME AS [referenced_table],
                            fk_referenced_column.COLUMN_NAME AS [referenced_column]
                        FROM INFORMATION_SCHEMA.COLUMNS c
                        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk_column
                            ON c.TABLE_NAME = fk_column.TABLE_NAME AND c.COLUMN_NAME = fk_column.COLUMN_NAME
                        LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS fk_constraint
                            ON fk_column.CONSTRAINT_NAME = fk_constraint.CONSTRAINT_NAME AND fk_constraint.CONSTRAINT_TYPE = 'FOREIGN KEY'
                        LEFT JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE fk_referenced_column
                            ON fk_constraint.CONSTRAINT_NAME = fk_referenced_column.CONSTRAINT_NAME
                        LEFT JOIN INFORMATION_SCHEMA.TABLES fk_referenced_table
                            ON fk_referenced_column.TABLE_NAME = fk_referenced_table.TABLE_NAME
                        WHERE c.TABLE_NAME IN ({placeholders});
                    """
                    await cursor.execute(query, valid_tables)
                    rows = await cursor.fetchall()

                    for row in rows:
                        table_name = row.TABLE_NAME
                        if role != "admin":
                            intent = next(
                                k
                                for k, v in self.table_config.items()
                                if v["table"] == table_name
                            )
                            allowed_columns = self.table_config[intent]["permissions"][
                                "user"
                            ]["allowed_columns"]
                            if row.COLUMN_NAME not in allowed_columns:
                                continue
                        schema.setdefault(table_name, []).append(
                            {
                                "column_name": row.COLUMN_NAME,
                                "data_type": row.DATA_TYPE,
                                "constraint": row.constraint
                                or ("NOT NULL" if row.IS_NULLABLE == "NO" else "NULL"),
                                "referenced_table": row.referenced_table,
                                "referenced_column": row.referenced_column,
                            }
                        )

                    logger.debug(
                        f"Specific schema for {valid_tables}: {json.dumps(schema, indent=2, ensure_ascii=False)}"
                    )
                    logger.info(
                        f"Specific schema retrieved successfully for tables: {list(schema.keys())}"
                    )
                    return schema
        except Exception as e:
            logger.error(
                f"Failed to retrieve specific schema for {valid_tables}: {str(e)}",
                exc_info=True,
            )
            return {}

    async def _execute_query_async(self, query: str, params: Tuple = ()) -> List[Dict]:
        """Execute an SQL query asynchronously and return results as dictionaries."""
        try:
            async with self._connect_async() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(query, params)
                    if cursor.description:
                        columns = [column[0] for column in cursor.description]
                        logger.info(f"Query columns: {columns}")
                        results = await cursor.fetchall()
                        return [dict(zip(columns, row)) for row in results]
                    await conn.commit()
                    return []
        except Exception as e:
            logger.error(
                f"Async query execution failed: {query}, Params: {params}, Error: {str(e)}",
                exc_info=True,
            )
            raise

    async def _execute_query_llm_async(
        self,
        query: str,
        params: Tuple = (),
        context: Dict = None,
        max_retries: int = 3,
    ) -> Union[List[Dict], Tuple[bool, str, Tuple, str]]:
        """Execute an LLM-generated SQL query asynchronously, retrying with LLM if it fails."""
        attempt = 0
        current_query = query
        current_params = params

        while attempt < max_retries:
            attempt += 1
            try:
                async with self._connect_async() as conn:
                    async with conn.cursor() as cursor:
                        await cursor.execute(current_query, current_params)
                        if cursor.description:
                            columns = [column[0] for column in cursor.description]
                            logger.info(f"Query columns: {columns}")
                            results = await cursor.fetchall()
                            return [dict(zip(columns, row)) for row in results]
                        await conn.commit()
                        return []
            except Exception as e:
                error_message = str(e)
                logger.error(
                    f"Async query execution failed (attempt {attempt}/{max_retries}): {current_query}, Params: {current_params}, Error: {error_message}",
                    exc_info=True,
                )
                if attempt == max_retries:
                    return (False, current_query, current_params, error_message)

                # Gọi LLM để sửa câu SQL, sử dụng context nếu có
                current_query, current_params_list = await self.call_llm_to_fix_sql(
                    query=current_query,
                    error_message=error_message,
                    params=current_params,
                    schema_description=(
                        context.get("schema_description", "") if context else ""
                    ),
                    user_id=(
                        context.get("user_id", "unknown") if context else "unknown"
                    ),
                    ids=context.get("ids", None) if context else None,
                    avalble_columns=(
                        context.get("avalble_columns", None) if context else None
                    ),
                    logic_str=context.get("logic_str", "") if context else "",
                    semantics_str=(context.get("semantics_str", "") if context else ""),
                )
                current_params = tuple(current_params_list)

    async def check_ownership(self, user_id: str, intent: str, data_id: str) -> bool:
        """Check if the user owns the data."""
        table_map = {
            "ride": ("RidePosts", "RidePostId"),
            "post": ("Posts", "Id"),
            "friends": ("Friendships", "Id"),
        }
        if intent not in table_map:
            return False

        table, id_col = table_map[intent]
        query = f"SELECT UserId FROM {table} WHERE {id_col} = ? AND IsDeleted = 0"
        results = await self._execute_query_async(query, (data_id,))
        return any(r["UserId"] == user_id for r in results)

    async def load_chat_history_async(self, conversation_id: str) -> List[Dict]:
        """Load chat history as user/assistant roles, remove duplicates with fuzzy matching."""
        if not conversation_id:
            logger.warning("Invalid ConversationId provided")
            return []

        query = """
        SELECT TOP 10
            h.Query, 
            h.Answer, 
            h.Context,
            h.TokenCount,
            h.Type
        FROM AIChatHistories h
        WHERE h.ConversationId = ?
        ORDER BY h.Timestamp DESC
        """
        results = await self._execute_query_async(query, (conversation_id))

        if not results:
            logger.info(f"No chat history found for ConversationId: {conversation_id}")
            return []

        seen_queries = []
        chat_history = []

        for r in results:
            query_text = r["Query"].strip() if r["Query"] else ""
            answer_text = r["Answer"].strip() if r["Answer"] else ""
            type = r["Type"].strip() if r["Type"] else ""
            context = r["Context"].strip() if r["Context"] else "[]"
            token_count = r["TokenCount"] if r["TokenCount"] is not None else 0

            if not query_text or not answer_text:
                logger.debug(
                    f"Skipping empty query or answer for ConversationId: {conversation_id}"
                )
                continue

            # Kiểm tra trùng lặp bằng fuzzy matching
            is_duplicate = False
            for seen_query in seen_queries:
                similarity = fuzz.ratio(query_text.lower(), seen_query.lower())
                if similarity > 85:  # Ngưỡng tương đồng 85%
                    logger.debug(
                        f"Duplicate query detected: '{query_text}' (similarity: {similarity}%)"
                    )
                    is_duplicate = True
                    break

            if is_duplicate:
                continue

            seen_queries.append(query_text)

            # Định dạng tin nhắn cho LLM
            try:
                # Parse Context để kiểm tra tính hợp lệ
                context_json = json.loads(context) if context else []

                # Thêm trường meaning nếu không có

                # Tạo tin nhắn user
                chat_history.append({"role": "user", "content": query_text})
                # Tạo tin nhắn assistant
                chat_history.append(
                    {
                        "role": "assistant",
                        "content": {
                            "answer": answer_text,
                            "context": context_json,
                            "token_count": token_count,
                            "type": type,
                        },
                    }
                )
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid Context JSON for query '{query_text}': {e}")
                chat_history.append(
                    {
                        "role": "assistant",
                        "content": {
                            "answer": answer_text,
                            "context": [],
                            "token_count": token_count,
                            "type": type,
                        },
                    }
                )

        if not chat_history:
            logger.info(
                f"No valid chat history found for ConversationId: {conversation_id}"
            )
        else:
            logger.debug(
                f"Loaded {len(chat_history)} messages for ConversationId: {conversation_id}"
            )

        return chat_history

    # data_loader.py
    async def save_generated_sql(
        self, sql_query: str, params: List, user_id: str, generated_sql_id: str
    ) -> None:
        query_sql = """
        INSERT INTO GeneratedSQLs (Id, SQLQuery, Params, UserId, CreatedAt, UpdatedAt)
        VALUES (?, ?, ?, ?, GETDATE(), GETDATE())
        """
        try:
            params_json = json.dumps(params)
            await self._execute_query_async(
                query_sql, (generated_sql_id, sql_query, params_json, user_id)
            )
            logger.info(f"Saved generated SQL with ID: {generated_sql_id}")
        except Exception as e:
            logger.error(f"Failed to save generated SQL: {str(e)}", exc_info=True)
            raise

    async def get_approved_sql(
        self, normalized_query: str, user_id: str
    ) -> Optional[Dict]:
        """Retrieve approved SQL from GeneratedSQLs via QueryCache."""
        query = """
        SELECT g.SQLQuery, g.Params
        FROM GeneratedSQLs g
        JOIN QueryCache qc ON g.Id = qc.GeneratedSQLId
        WHERE qc.NormalizedQuery = ? AND qc.UserId = ? AND g.IsApproved = 0
        """
        try:
            results = await self._execute_query_async(
                query, (normalized_query, user_id)
            )
            if results:
                logger.info(
                    f"Found approved SQL for query: {normalized_query}, user: {user_id}"
                )
                return {
                    "sql": results[0]["SQLQuery"],
                    "params": (
                        json.loads(results[0]["Params"]) if results[0]["Params"] else []
                    ),
                }
            logger.info(
                f"No approved SQL found for query: {normalized_query}, user: {user_id}"
            )
            return None
        except Exception as e:
            logger.error(f"Failed to get approved SQL: {str(e)}", exc_info=True)
            return None

    async def approve_generated_sql(
        self, sql_id: str, rating: int, is_approved: bool
    ) -> None:
        """Approve or rate a generated SQL query."""
        query = """
        UPDATE GeneratedSQLs
        SET Rating = ?, IsApproved = ?, UpdatedAt = GETDATE()
        WHERE Id = ?
        """
        try:
            await self._execute_query_async(query, (rating, is_approved, sql_id))
            logger.info(
                f"Updated SQL {sql_id} with rating {rating} and approved={is_approved}"
            )
        except Exception as e:
            logger.error(f"Failed to approve SQL {sql_id}: {str(e)}", exc_info=True)
            raise

    async def _format_content_async(
        self, data: Dict, query: str, table_name: str, role: str = "user"
    ) -> str:
        """Format data into a natural language string based on table_name and role."""
        try:
            # Chuẩn hóa thời gian
            for time_field in ["StartTime", "CreatedAt", "UpdatedAt", "EndTime"]:
                if time_field in data and isinstance(data[time_field], datetime):
                    data[time_field] = data[time_field].strftime("%H:%M, %d/%m/%Y")

            # Tạo bản sao dữ liệu để thay đổi trạng thái
            formatted_data = data.copy()

            # Các trường trạng thái cần chuyển đổi cho từng bảng
            status_fields = {
                "RidePosts": ["PostType", "Status", "PostRideType"],
                "Rides": ["Status"],
                "Friendships": ["Status"],
                "Groups": ["Privacy", "Role"],
                "Reports": ["Status"],
                "Users": ["Role"],
                "Alerts": ["Type"],
                "Ratings": ["Level"],
                "Messages": ["Status"],
                "Notifications": ["Type"],
            }

            # Chuyển đổi các trường trạng thái sang chuỗi tiếng Việt
            for field in status_fields.get(table_name, []):
                if field in formatted_data and isinstance(
                    formatted_data[field], (int, str)
                ):
                    try:
                        formatted_data[field] = self.convert_status_to_string(
                            table_name, field, int(formatted_data[field])
                        )
                    except ValueError:
                        logger.warning(
                            f"Cannot convert {field} value {formatted_data[field]} to int for table {table_name}"
                        )

            # Lấy template từ format_templates
            format_template = self.format_templates.get(table_name, {}).get(
                role, self.format_templates.get(table_name, {}).get("user", "")
            )
            if not format_template:
                logger.warning(
                    f"No format template found for table {table_name}, role {role}"
                )
                return await self._format_default(formatted_data, query, role)

            # Thay thế giá trị vào template
            try:
                template = Template(format_template)
                formatted_content = template.safe_substitute(
                    {k: v or "Không có" for k, v in formatted_data.items()}
                )
                return formatted_content
            except Exception as e:
                logger.error(
                    f"Error applying template for table {table_name}: {str(e)}"
                )
                return await self._format_default(formatted_data, query, role)

        except Exception as e:
            logger.error(
                f"Error formatting content for table {table_name}: {str(e)}",
                exc_info=True,
            )
            return "Không thể xử lý thông tin do lỗi hệ thống."

    async def _format_default(self, data: Dict, query: str, role: str) -> str:
        """Default formatter for tables without specific template."""
        config = self.table_config.get(data.get("table", ""), {})
        columns = config.get("columns", [])
        result = []
        for key, value in data.items():
            if value is not None and key in columns:
                result.append(f"{key}: {value}")
        return ", ".join(result) or "Không có thông tin phù hợp."

    # data_loader.py
    async def load_user_queries_async(
        self, user_id: Optional[str] = None
    ) -> List[Dict]:
        query = """
        SELECT Query, NormalizedQuery, Embedding
        FROM QueryCache
        """
        params = []
        if user_id is not None:
            query += " WHERE UserId = ?"
            params.append(user_id)

        try:
            results = await self._execute_query_async(query, tuple(params))
            user_queries = []
            for r in results:
                try:
                    embedding = json.loads(r["Embedding"]) if r["Embedding"] else []
                    if not embedding:
                        logger.warning(
                            f"Empty embedding for query: {r['NormalizedQuery']}"
                        )
                        continue
                    user_queries.append(
                        {
                            "query": r["NormalizedQuery"],
                            "embedding": embedding,
                        }
                    )
                except json.JSONDecodeError as e:
                    logger.error(
                        f"Failed to decode embedding for query {r['NormalizedQuery']}: {e}"
                    )
            logger.info(
                f"Loaded {len(user_queries)} user queries for user {user_id or 'admin'}"
            )
            return user_queries
        except Exception as e:
            logger.error(f"Failed to load user queries: {str(e)}", exc_info=True)
            return []

    async def get_generated_sql(
        self, normalized_query: str, user_id: str
    ) -> Optional[Dict]:
        """Retrieve generated SQL from GeneratedSQLs via QueryCache."""
        query = """
            SELECT TOP 1 g.Id AS GeneratedSQLId, g.SQLQuery, g.Params
            FROM GeneratedSQLs g
            JOIN QueryCache qc ON g.Id = qc.GeneratedSQLId
            WHERE qc.NormalizedQuery = ? AND qc.UserId = ?
            ORDER BY g.CreatedAt DESC
            """
        try:
            results = await self._execute_query_async(
                query, (normalized_query, user_id)
            )
            if results:
                logger.info(
                    f"Found cached SQL for query: {normalized_query}, user: {user_id}"
                )
                return {
                    "sql": results[0]["SQLQuery"],
                    "params": (
                        json.loads(results[0]["Params"]) if results[0]["Params"] else []
                    ),
                }
            logger.info(
                f"No cached SQL found for query: {normalized_query}, user: {user_id}"
            )
            return None
        except Exception as e:
            logger.error(f"Failed to get generated SQL: {str(e)}", exc_info=True)
            return None

    def convert_status_to_string(
        self, table_name: str, field_name: str, value: int
    ) -> str:
        """Convert an integer status value to a Vietnamese string based on table and field."""
        status_mappings = {
            "RidePosts": {
                "PostType": {
                    0: "Di chuyển",
                    1: "Tài liệu học tập",
                    2: "Trao đổi",
                    3: "Nhóm học tập",
                    4: "Thảo luận",
                },
                "Status": {0: "Đang mở", 1: "Đã tìm được người đi chung", 2: "Bị hủy"},
                "PostRideType": {0: "Đăng chuyến đi", 1: "Yêu cầu chuyến đi"},
            },
            "Rides": {
                "Status": {
                    0: "Đang chờ",
                    1: "Đã chấp nhận",
                    2: "Bị từ chối",
                    3: "Hoàn thành",
                }
            },
            "Friendships": {
                "Status": {
                    0: "Đang chờ xác nhận",
                    1: "Đã kết bạn",
                    2: "Đã từ chối",
                    3: "Đã hủy kết bạn",
                }
            },
            "Groups": {
                "Privacy": {0: "Công khai", 1: "Riêng tư", 2: "Bí mật"},
                "Role": {0: "Thành viên", 1: "Quản trị viên", 2: "Chủ nhóm"},
            },
            "Reports": {"Status": {0: "Đang chờ", 1: "Đã xem xét", 2: "Bị từ chối"}},
            "Users": {"Role": {0: "Người dùng", 1: "Quản trị viên"}},
            "Alerts": {
                "Type": {
                    0: "Tài xế tắt GPS",
                    1: "Chuyến đi bị trễ",
                    2: "Không phản hồi",
                }
            },
            "Ratings": {"Level": {0: "Kém", 1: "Trung bình", 2: "Tốt", 3: "Xuất sắc"}},
            "Messages": {"Status": {0: "Đã gửi", 1: "Đã nhận", 2: "Đã xem"}},
            "Notifications": {
                "Type": {
                    0: "Bài viết được thích",
                    1: "Bài viết được bình luận",
                    2: "Bài viết được chia sẻ",
                    3: "Tin nhắn mới",
                    4: "Yêu cầu kết bạn mới",
                    5: "Lời mời đi chung",
                    6: "Cảnh báo hệ thống",
                    7: "Gửi yêu cầu kết bạn",
                    8: "Chấp nhận kết bạn",
                    9: "Từ chối kết bạn",
                }
            },
        }

        # Lấy ánh xạ cho bảng và trường
        mapping = status_mappings.get(table_name, {}).get(field_name, {})
        # Trả về chuỗi tiếng Việt hoặc giá trị gốc nếu không tìm thấy ánh xạ
        return mapping.get(value, str(value))

    async def call_llm_to_fix_sql(
        self,
        query: str,
        error_message: str,
        params: Tuple = (),
        schema_description: str = "",
        user_id: str = "unknown",
        ids: List[str] = None,
        avalble_columns: List[str] = None,
        logic_str: str = "",
        semantics_str: str = "",
    ) -> Tuple[str, List]:
        """Gọi Gemini API để sửa câu SQL dựa trên lỗi, trả về (sql, params)."""
        prompt = PromptTemplate(
            input_variables=[
                "query",
                "error_message",
                "params",
                "schema",
                "user_id",
                "ids",
                "avalble_columns",
                "logic_str",
                "semantics_str",
            ],
            template="""
            You are a helpful AI expert in SQL, specifically designed to debug and correct SQL queries for Gemini 1.5 Flash.

            The following SQL query failed:

            ```sql
            {query}
            ```

            Original parameters: {params}
            Error message: {error_message}
            Database schema: {schema}
            User ID: {user_id}
            IDs (if any): {ids}
            Available columns: {avalble_columns}
            Logic description: {logic_str}
            Semantics description: {semantics_str}

            Please provide a corrected SQL query that is syntactically and semantically correct, addresses the specific error, and adheres to the database schema. Ensure the query:

            ** Maintains the exact same number and order of parameters, using '?' for placeholders. The values for these placeholders are: {params}. Do not change the parameters themselves, only the SQL structure.
            ** If using aggregate functions (e.g., COUNT, SUM, AVG) with non-aggregated columns, always include a GROUP BY clause for the non-aggregated columns.
            ** Carefully verify the query against the provided schema and available columns to ensure all referenced tables and columns exist and are used correctly.
            ** When correcting complex queries involving JOINs or subqueries, ensure the original logic for combining data and the purpose of the subqueries are preserved.
            ** Aim to correct not only syntax errors but also potential logical errors based on the provided logic and semantics descriptions.

            **Example**:
            If the query is:
            ```sql
            SELECT COUNT(*) AS total, user_id FROM users WHERE user_id = ?
            ```
            And the error is about missing GROUP BY, correct it to:
            {{
                "sql": "SELECT COUNT(*) AS total, user_id FROM users WHERE user_id = ? GROUP BY user_id",
                "params": ["user123"]
            }}
            
            **Output Format:**
            Return a strict JSON object containing two keys:
            1. `sql`: The generated SQL query string.
            2. `params`: A list containing the values for the SQL placeholders (`?`) in the correct order.
            """,
        )
        try:
            chain = prompt | self.sql_llm
            response = await chain.ainvoke(
                {
                    "query": query,
                    "error_message": error_message,
                    "params": list(params),
                    "schema": schema_description,
                    "user_id": user_id,
                    "ids": ids if ids else "None",
                    "avalble_columns": avalble_columns if avalble_columns else "None",
                    "logic_str": logic_str,
                    "semantics_str": semantics_str,
                }
            )
            cleaned_content = re.sub(r"```json\n|\n```", "", response.content).strip()
            try:
                preprocess_result = json.loads(cleaned_content)
                corrected_query = preprocess_result.get("sql", query)
                corrected_params = preprocess_result.get("params", list(params))

                if not isinstance(corrected_query, str) or not isinstance(
                    corrected_params, list
                ):
                    logger.warning(
                        f"LLM response did not contain expected 'sql' (string) and 'params' (list) keys. Returning original query."
                    )
                    return query, list(params)

                logger.info(
                    f"Corrected query from LLM: {corrected_query}, Params: {corrected_params}"
                )
                return corrected_query, corrected_params
            except json.JSONDecodeError as e:
                logger.error(
                    f"Failed to parse LLM response as JSON: {e}. Response content: '{cleaned_content}'"
                )
                return query, list(params)
        except Exception as e:
            logger.error(f"Failed to call LLM: {str(e)}")
            return query, list(params)
