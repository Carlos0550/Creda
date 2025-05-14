import sys
import os
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Configurar logging mejorado
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("creda-api")

app = FastAPI(
    title="Creda - Predict Model Service",
    description="Servicio de predicción de riesgo financiero",
    version="0.1.0",
)


# Middleware para logging de todas las solicitudes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"[REQUEST] {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"[RESPONSE] Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"[ERROR] {str(e)}")
        raise


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Importar las rutas después de crear la app
from routes import predict

app.include_router(predict.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
