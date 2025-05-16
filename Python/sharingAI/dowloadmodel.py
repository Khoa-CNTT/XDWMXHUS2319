import requests
import os

# Tạo thư mục nếu chưa tồn tại

url = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q2_K.gguf"
output_path = r"E:\DOANTOTNGHIEP\AI\python\models\mistral-7b-instruct-v0.2.Q2_K.gguf"

with requests.get(url, stream=True) as r:
    r.raise_for_status()
    with open(output_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

print("✅ Đã tải xong mô hình vào thư mục models!")
