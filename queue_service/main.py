from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from pipelines.start_pipeline_analysis_pipeline.__main__ import start_pipeline_analysis_pipeline

stop_event = asyncio.Event

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando servicio de colas...")
    task = asyncio.create_task(start_pipeline_analysis_pipeline(stop_event))
    yield
    print("Deteniendo servicio de colas...")
    stop_event.set()
    await task
    print("Servicio de colas detenido...")

app = FastAPI(lifespan=lifespan)

    