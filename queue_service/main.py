from fastapi import FastAPI, Request
import json

from redis_queue import enqueue_prediction, r

app = FastAPI()

@app.post("/enqueue")
async def enqueue(request:Request):
    data = await request.json()
    task_id = enqueue_prediction(data)
    return {
        "status": "enqueued", 
        "data": data,
        "queue_id": task_id
    }
@app.get("/status/{task_id}")
def get_status(task_id:str):
    data = r.hgetall(f"predict_status:{task_id}")
    print(data)
    if not data:
        return {"status": "not_found"}
    return {
        "id": task_id,
        "status": data.get("status"),
        "payload": json.loads(data.get("data")) if data.get("data") else None
    }