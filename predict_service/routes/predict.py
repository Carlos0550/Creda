from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import os
from tempfile import NamedTemporaryFile
from model.model_instance import model  # Importamos el modelo precargado
from model.mlservice import predict  # Importamos solo la función predict

router = APIRouter()


@router.post("/predict")
async def predict_endpoint(
    file: UploadFile = File(...),
):  # Cambio el nombre para evitar conflicto
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400, detail="El archivo ingresado debe ser un CSV válido"
        )
    try:
        tmp = NamedTemporaryFile(delete=False, suffix=".csv")
        tmp.write(await file.read())
        tmp.close()

        df = pd.read_csv(tmp.name)
        os.remove(tmp.name)

        # Usar el modelo precargado con la función predict
        result = predict(model, df)

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error procesando el archivo: {str(e)}"
        )
