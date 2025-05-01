from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import os
from tempfile import NamedTemporaryFile #Crea un archivo temporal en disco a partir del buffer

router = APIRouter()

@router.post("/predict")
async def predict(file:UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="El archivo ingresado debe ser un CSV válido"
        )
    try:
        tmp = NamedTemporaryFile(delete=False, suffix=".csv")
        tmp.write(await file.read())
        tmp.close()

        df = pd.read_csv(tmp.name) #.name es la ruta temporal al archivo temporal
        os.remove(tmp.name)

        return {
            "status": "ok",
            "rows_received": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando el archivo: {str(e)}"
        )