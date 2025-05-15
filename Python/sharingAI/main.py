from flask import Flask, request, jsonify
from data_loader import DataLoader
from vector_store import VectorStore
from answer_generator import AnswerGenerator
from config import SQL_SERVER_CONNECTION, NETCORE_API_URL, SIGNALR_HUB_URL
import asyncio
import aiohttp
import logging
from signalrcore.hub_connection_builder import HubConnectionBuilder
import json
import websocket
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
data_loader = DataLoader(SQL_SERVER_CONNECTION)
vector_store = VectorStore()
answer_generator = AnswerGenerator(vector_store.vectorstore)

@app.route('/api/query', methods=['POST'])
async def handle_query():
    data = request.get_json()
    query = data.get('query')
    user_id = data.get('user_id')
    conversation_id = data.get('conversation_id', '')

    history = ""
    if conversation_id:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{NETCORE_API_URL}/api/ChatAI/history?conversationId={conversation_id}",
                headers={"Authorization": request.headers.get('Authorization')}
            ) as resp:
                if resp.status == 200:
                    history = await resp.text()
                    answer_generator.memory.load_memory_variables({"chat_history": history})

    documents = vector_store.search(query)
    answer = answer_generator.generate_answer(query, documents)

    await send_to_signalr(conversation_id, user_id, answer, True)

    async with aiohttp.ClientSession() as session:
        await session.post(
            f"{NETCORE_API_URL}/api/ChatAI/save-history",
            json={"ConversationId": conversation_id, "UserId": user_id, "Query": query, "Answer": answer},
            headers={"Authorization": request.headers.get('Authorization')}
        )

    return jsonify({"conversation_id": conversation_id, "message": "Query processed"})

def send_to_signalr(message: str, conversation_id: str):
    try:
        ws = websocket.WebSocket()
        ws.connect(SIGNALR_HUB_URL)
        
        # Khởi tạo kết nối SignalR
        init_message = {
            "protocol": "json",
            "version": 1
        }
        ws.send(json.dumps(init_message) + "\u001e")
        
        # Gửi tin nhắn
        send_message = {
            "arguments": [conversation_id, message],
            "invocationId": "0",
            "target": "SendMessage",
            "type": 1
        }
        ws.send(json.dumps(send_message) + "\u001e")
        
        ws.close()
        logger.info(f"Sent message to SignalR: {message}")
    except Exception as e:
        logger.error(f"Error sending to SignalR: {str(e)}")

def initialize_data():
    data = data_loader.load_users()
    standardized_data = [
        {"id": f"users_{item['Id']}", "content": item['Content'], "table": "users"}
        for item in data
    ]
    vector_store.store_data(standardized_data)

if __name__ == "__main__":
    initialize_data()
    app.run(host='0.0.0.0', port=5000)