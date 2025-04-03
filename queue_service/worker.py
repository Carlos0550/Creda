import redis
import json
import os
from dotenv import load_dotenv
import time

load_dotenv()

r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)

flag = True
while flag:
    try:
        task = r.blpop("predict_queue")
        if task:
            _, data_str = task
            task_data = json.loads(data_str)
            task_id = task_data["id"]
            payload = task_data["payload"]
            print(f"Nuevo archivo recibido [ID: {task_id}]")
            print(json.dumps(payload, indent=4))
            time.sleep(5)
            print(f"Analizando columnas [ID: {task_id}]...")
            r.hset(f"predict_status:{task_id}",mapping={
                "status": "analyzing"
            })
            print(f"Analisis completado[ID: {task_id}]!")
            r.hset(f"predict_status:{task_id}", mapping= {
                "status": "analyzed"
            })
            r.delete(f"predict_status:{task_id}")
            

    except KeyboardInterrupt:
        print("Worker detenido por el usuario.")
        flag = False
    
    except Exception as e:
        print(f"⚠️ Error procesando tarea: {e}")
        flag = False