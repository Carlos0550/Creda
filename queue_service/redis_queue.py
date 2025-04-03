import os 
import redis
import json
from dotenv import load_dotenv
import uuid

load_dotenv()
r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)

def enqueue_prediction(data: dict):
    new_taskid = str(uuid.uuid4())
    task = {
        "id": str(new_taskid),
        "payload": data
    }
    r.rpush("predict_queue", json.dumps(task))
    r.hset(f"predict_status:{new_taskid}",mapping={
        "status": "waiting",
        "data": json.dumps(task)
    })
    return new_taskid