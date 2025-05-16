import redis

# Kết nối đến Redis server (mặc định db=0)
r = redis.Redis(host="localhost", port=6379, db=0)

# Lấy danh sách tất cả các key trong Redis
r.flushdb()
keys = r.keys("*")
# r.delete(
#     "conversation:37da4e75-6779-4fcd-aff0-3ecb0daac24b:cfa82dce-5902-4419-a6a1-3d8066bad303"
# )

# Duyệt qua tất cả các key và in ra giá trị tùy theo kiểu dữ liệu
for key in keys:
    key_type = r.type(key)  # Kiểm tra kiểu dữ liệu của key
    print(f"Key: {key.decode('utf-8')}, Type: {key_type.decode('utf-8')}")

    if key_type == b"string":
        value = r.get(key)
        print(f"Value (string): {value.decode('utf-8')}")
    elif key_type == b"list":
        value = r.lrange(key, 0, -1)  # Lấy tất cả phần tử trong list
        print(f"Value (list): {', '.join([v.decode('utf-8') for v in value])}")
    elif key_type == b"set":
        value = r.smembers(key)  # Lấy tất cả phần tử trong set
        print(f"Value (set): {', '.join([v.decode('utf-8') for v in value])}")

    elif key_type == b"zset":
        value = r.zrange(key, 0, -1)  # Lấy tất cả phần tử trong sorted set
        print(f"Value (zset): {', '.join([v.decode('utf-8') for v in value])}")
    else:
        print(f"Unsupported key type: {key_type.decode('utf-8')}")
