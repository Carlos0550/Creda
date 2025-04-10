from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from pipelines.start_pipeline_analysis_pipeline.__main__ import start_pipeline_analysis_pipeline
from pipelines.start_pipeline_analysis_pipeline.logging_config import setup_logging

stop_event = asyncio.Event()
setup_logging()

import logging
logger = logging.getLogger("my_logger")
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("Iniciando servicio de colas...")
    task = asyncio.create_task(start_pipeline_analysis_pipeline(stop_event))
    yield
    logger.debug("Deteniendo servicio de colas...")
    stop_event.set()
    await task
    logger.debug("Servicio de colas detenido...")

app = FastAPI(lifespan=lifespan)

    