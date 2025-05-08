from fastapi import FastAPI
from routes import predict

app = FastAPI(
    title="Creda - Predict Model Service",
    description="Servicio de predicción de riesgo financiero",
    version="0.1.0"
)

app.include_router(predict.router)