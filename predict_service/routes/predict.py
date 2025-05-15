from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
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


# Definición del modelo de datos para el formulario
class CreditPredictionForm(BaseModel):
    PAYMENT_DAY: int
    APPLICATION_SUBMISSION_TYPE: str
    SEX: str
    MARITAL_STATUS: str
    QUANT_DEPENDANTS: int
    STATE_OF_BIRTH: str
    CITY_OF_BIRTH: str
    RESIDENCIAL_STATE: str
    RESIDENCIAL_CITY: str
    FLAG_RESIDENCIAL_PHONE: int
    RESIDENCE_TYPE: str
    MONTHS_IN_RESIDENCE: int
    FLAG_EMAIL: int
    TOTAL_MONTHLY_INCOME: float
    QUANT_BANKING_ACCOUNTS: int
    QUANT_SPECIAL_BANKING_ACCOUNTS: int
    PERSONAL_ASSETS_VALUE: float
    QUANT_CARS: int
    COMPANY: str
    PROFESSION_CODE: str
    OCCUPATION_TYPE: str
    FLAG_VISA: int
    FLAG_MASTERCARD: int
    FLAG_OTHER_CARDS: int
    PRODUCT: str
    AGE: int
    RESIDENCIAL_ZIP_3: str
    FLAG_DINERS: int = 0  # Opcional, para poder calcular HAS_CREDIT_CARD
    FLAG_AMERICAN_EXPRESS: int = 0  # Opcional, para poder calcular HAS_CREDIT_CARD

    class Config:
        schema_extra = {
            "example": {
                "PAYMENT_DAY": 10,
                "APPLICATION_SUBMISSION_TYPE": "Web",
                "SEX": "F",
                "MARITAL_STATUS": "1.0",
                "QUANT_DEPENDANTS": 0,
                "STATE_OF_BIRTH": "SP",
                "CITY_OF_BIRTH": "SAO PAULO",
                "RESIDENCIAL_STATE": "SP",
                "RESIDENCIAL_CITY": "SAO PAULO",
                "FLAG_RESIDENCIAL_PHONE": 1,
                "RESIDENCE_TYPE": "1.3",
                "MONTHS_IN_RESIDENCE": 29,
                "FLAG_EMAIL": 0,
                "TOTAL_MONTHLY_INCOME": 1118.93,
                "QUANT_BANKING_ACCOUNTS": 1,
                "QUANT_SPECIAL_BANKING_ACCOUNTS": 0,
                "PERSONAL_ASSETS_VALUE": 0.7,
                "QUANT_CARS": 0,
                "COMPANY": "Y",
                "PROFESSION_CODE": "9",
                "OCCUPATION_TYPE": "2.0",
                "FLAG_VISA": 1,
                "FLAG_MASTERCARD": 0,
                "FLAG_OTHER_CARDS": 0,
                "PRODUCT": "2.1",
                "AGE": 29,
                "RESIDENCIAL_ZIP_3": "318",
            }
        }


@router.post("/predict-form")
async def predict_form(form_data: CreditPredictionForm = Body(...)):
    """
    Endpoint para procesar datos de formulario y realizar predicción de crédito.
    """
    try:
        # Convertir los datos del formulario a un diccionario
        data = form_data.dict()

        # Asegurarnos de que todas las banderas de tarjetas estén presentes
        flag_columns = [
            "FLAG_VISA",
            "FLAG_MASTERCARD",
            "FLAG_DINERS",
            "FLAG_AMERICAN_EXPRESS",
            "FLAG_OTHER_CARDS",
        ]

        for flag in flag_columns:
            if flag not in data:
                data[flag] = 0

        # 1. Calcular HAS_CREDIT_CARD a partir de las banderas
        data["HAS_CREDIT_CARD"] = (
            1
            if (
                data["FLAG_VISA"] > 0
                or data["FLAG_MASTERCARD"] > 0
                or data["FLAG_DINERS"] > 0
                or data["FLAG_AMERICAN_EXPRESS"] > 0
                or data["FLAG_OTHER_CARDS"] > 0
            )
            else 0
        )

        # 2. Convertir ciudades a minúsculas
        for field in ["CITY_OF_BIRTH", "RESIDENCIAL_CITY"]:
            if isinstance(data.get(field), str):
                data[field] = data[field].lower()

        # 3. Crear ID_CLIENT con formato numérico
        client_id = f"70{data['AGE']}{data['PAYMENT_DAY']}"
        data["ID_CLIENT"] = client_id

        # Crear un DataFrame con los datos
        df = pd.DataFrame([data])

        # IMPORTANTE: Asegurarse de que las columnas de banderas existan en el DataFrame
        for flag in flag_columns:
            if flag not in df.columns:
                df[flag] = data.get(flag, 0)

        # Añadir columnas necesarias para el preprocesamiento (código existente)
        additional_columns = {
            "RESIDENCIAL_PHONE_AREA_CODE": "5",
            # Las otras columnas...
        }

        # NO USAR predictions_data(), ir directamente a predict
        # predictions_data() está provocando el error al intentar recalcular HAS_CREDIT_CARD

        # Verificar que todas las columnas principales estén presentes
        print(f"Columnas antes de predicción: {df.columns.tolist()}")
        print(f"FLAG_VISA presente: {'FLAG_VISA' in df.columns}")
        print(f"HAS_CREDIT_CARD presente: {'HAS_CREDIT_CARD' in df.columns}")

        # Usar el modelo directamente sin preprocesamiento adicional
        result = predict(model, df)

        # Añadir ID a la respuesta para mejor trazabilidad
        result["client_id"] = client_id

        return result

    except Exception as e:
        import traceback

        print(f"Error en predicción de formulario: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail={"status": "error", "message": str(e)}
        )
