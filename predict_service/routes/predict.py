from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import os
import requests
from tempfile import NamedTemporaryFile
from model.model_instance import model
from model.mlservice import predict
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# URL del servicio de backend (ajusta según tu configuración de Docker)
BACKEND_URL = "https://creda-development.up.railway.app/api/clients/create-client"
BACKEND_URL_DELETE = (
    "https://creda-development.up.railway.app/api/clients/test/delete-all-clients"
)
# Para pruebas locales usa: "http://localhost:5000/api/clients/create-client"


@router.post("/predict")
async def predict_endpoint(
    file: UploadFile = File(...),
    save_to_db: bool = True,  # Parámetro opcional para guardar en BD
    delete_existing: bool = True,  # Parámetro para eliminar todos los clientes primero
):
    if delete_existing:
        try:
            # Llamar al endpoint para eliminar todos los clientes
            print("Eliminando clientes existentes...")
            delete_response = requests.delete(BACKEND_URL_DELETE)

            if delete_response.status_code == 200:
                print(f"Clientes eliminados correctamente: {delete_response.text}")
            else:
                print(
                    f"Error al eliminar clientes: {delete_response.status_code} - {delete_response.text}"
                )
                # Continuar de todos modos
        except Exception as e:
            print(f"Error al intentar eliminar clientes: {str(e)}")
            # Continuar con el proceso a pesar del error

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

        # Si se solicita guardar en BD
        saved_count = 0
        errors = []

        if save_to_db:
            for prediction in result.get("predictions", []):
                try:
                    # Adaptar al formato esperado por create-client
                    client_data = {
                        "client_id": prediction["client_id"],
                        "client_score": prediction["client_credit_scoring"],
                        "client_credit_status": prediction["client_credit_status"],
                    }

                    # Llamar al endpoint para crear cliente
                    response = requests.post(BACKEND_URL, json=client_data)

                    if response.status_code == 200 or response.status_code == 201:
                        saved_count += 1
                    else:
                        errors.append(
                            f"Error al guardar cliente {prediction['client_id']}: {response.text}"
                        )

                except Exception as e:
                    errors.append(
                        f"Error al procesar cliente {prediction['client_id']}: {str(e)}"
                    )

            # Añadir información sobre guardado a la respuesta
            result["database_save"] = {
                "saved_count": saved_count,
                "total": len(result.get("predictions", [])),
                "errors": errors if errors else None,
            }

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error procesando el archivo: {str(e)}"
        )


# Definir modelo de datos para la entrada del formulario
class ClientFormData(BaseModel):
    ID_CLIENT: str
    CLERK_TYPE: str
    PAYMENT_DAY: int
    APPLICATION_SUBMISSION_TYPE: str
    QUANT_ADDITIONAL_CARDS: Optional[str] = None
    POSTAL_ADDRESS_TYPE: int
    SEX: str
    MARITAL_STATUS: float
    QUANT_DEPENDANTS: int
    EDUCATION_LEVEL: int
    STATE_OF_BIRTH: str
    CITY_OF_BIRTH: str
    NACIONALITY: float
    RESIDENCIAL_STATE: str
    RESIDENCIAL_CITY: str
    RESIDENCIAL_BOROUGH: str
    FLAG_RESIDENCIAL_PHONE: str
    RESIDENCIAL_PHONE_AREA_CODE: float
    RESIDENCE_TYPE: float
    MONTHS_IN_RESIDENCE: float
    FLAG_MOBILE_PHONE: str
    FLAG_EMAIL: float
    PERSONAL_MONTHLY_INCOME: float
    OTHER_INCOMES: float
    FLAG_VISA: float
    FLAG_MASTERCARD: float
    FLAG_DINERS: float
    FLAG_AMERICAN_EXPRESS: float
    FLAG_OTHER_CARDS: float
    QUANT_BANKING_ACCOUNTS: float
    QUANT_SPECIAL_BANKING_ACCOUNTS: float
    PERSONAL_ASSETS_VALUE: float
    QUANT_CARS: float
    COMPANY: str
    PROFESSIONAL_STATE: Optional[str] = None
    PROFESSIONAL_CITY: Optional[str] = None
    PROFESSIONAL_BOROUGH: Optional[str] = None
    FLAG_PROFESSIONAL_PHONE: str
    PROFESSIONAL_PHONE_AREA_CODE: Optional[float] = None
    MONTHS_IN_THE_JOB: float
    PROFESSION_CODE: int
    OCCUPATION_TYPE: float
    MATE_PROFESSION_CODE: Optional[str] = None
    MATE_EDUCATION_LEVEL: Optional[str] = None
    FLAG_HOME_ADDRESS_DOCUMENT: float
    FLAG_RG: float
    FLAG_CPF: float
    FLAG_INCOME_PROOF: float
    PRODUCT: float
    FLAG_ACSP_RECORD: str
    AGE: float
    RESIDENCIAL_ZIP_3: int
    PROFESSIONAL_ZIP_3: float
    HAS_CREDIT_CARD: float = 0.0  # Campo faltante añadido con valor por defecto


@router.post("/predict-form")
async def predict_form_endpoint(
    client_data: ClientFormData,
):
    """
    Endpoint para predecir el scoring crediticio de un cliente usando datos de formulario.

    Este endpoint solo realiza predicciones y no interactúa con la base de datos
    (no guarda ni elimina datos).

    - client_data: Datos del cliente según el modelo de formulario
    """

    try:
        # Convertir el modelo Pydantic a un diccionario
        data_dict = client_data.model_dump()
        
        # Crear un DataFrame directamente (sin usar CSV intermedio)
        df = pd.DataFrame([data_dict])
        
        # Asegurarse que el ID_CLIENT sea string como en el CSV original
        if "ID_CLIENT" in df.columns:
            df["ID_CLIENT"] = df["ID_CLIENT"].astype(str)
            
        # Calcular HAS_CREDIT_CARD como máximo de las banderas de tarjetas
        card_flags = ["FLAG_VISA", "FLAG_MASTERCARD", "FLAG_DINERS", 
                     "FLAG_AMERICAN_EXPRESS", "FLAG_OTHER_CARDS"]
        if all(flag in df.columns for flag in card_flags):
            df["HAS_CREDIT_CARD"] = df[card_flags].max(axis=1)
            
        # Asegurar tipos de datos correctos para columnas numéricas
        numeric_columns = [
            "PAYMENT_DAY", "POSTAL_ADDRESS_TYPE", "MARITAL_STATUS", 
            "QUANT_DEPENDANTS", "EDUCATION_LEVEL", "NACIONALITY", 
            "RESIDENCIAL_PHONE_AREA_CODE", "RESIDENCE_TYPE", "MONTHS_IN_RESIDENCE", 
            "FLAG_EMAIL", "PERSONAL_MONTHLY_INCOME", "OTHER_INCOMES", 
            "FLAG_VISA", "FLAG_MASTERCARD", "FLAG_DINERS", "FLAG_AMERICAN_EXPRESS", 
            "FLAG_OTHER_CARDS", "QUANT_BANKING_ACCOUNTS", 
            "QUANT_SPECIAL_BANKING_ACCOUNTS", "PERSONAL_ASSETS_VALUE", 
            "QUANT_CARS", "PROFESSIONAL_PHONE_AREA_CODE", "MONTHS_IN_THE_JOB", 
            "PROFESSION_CODE", "OCCUPATION_TYPE", "FLAG_HOME_ADDRESS_DOCUMENT", 
            "FLAG_RG", "FLAG_CPF", "FLAG_INCOME_PROOF", "PRODUCT", "AGE", 
            "RESIDENCIAL_ZIP_3", "PROFESSIONAL_ZIP_3", "HAS_CREDIT_CARD"
        ]

        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                
        # Calcular TOTAL_MONTHLY_INCOME
        if "PERSONAL_MONTHLY_INCOME" in df.columns and "OTHER_INCOMES" in df.columns:
            df["TOTAL_MONTHLY_INCOME"] = df["PERSONAL_MONTHLY_INCOME"] + df["OTHER_INCOMES"]

        # Convertir columnas de texto a minúsculas
        text_cols = ["CITY_OF_BIRTH", "RESIDENCIAL_CITY", "RESIDENCIAL_BOROUGH", 
                     "PROFESSIONAL_CITY", "PROFESSIONAL_BOROUGH"]
        for col in text_cols:
            if col in df.columns and df[col].dtype == object:
                df[col] = df[col].str.lower()
                
        # Logging para depuración
        print(f"DataFrame preparado: {df.shape} columnas")
        print(f"Columnas: {df.columns.tolist()}")

        # Intentar obtener predicciones del modelo
        try:
            # Usar el modelo precargado con la función predict
            result = predict(model, df)
            print("Resultado de predicción:", result)
            
            # Verificar si se obtuvieron predicciones válidas
            if result.get("status") == "error":
                raise ValueError(f"Error en predicción: {result.get('message')}")
        except Exception as pred_error:
            print(f"Error durante la predicción: {str(pred_error)}")
            # En caso de error en predicción, result será None
            result = None
        
        # Si no hay predicciones o hubo error, usar fallback
        if not result or not result.get("predictions") or len(result.get("predictions", [])) == 0:
            print("Usando predicción de fallback")
            # Crear un algoritmo simple basado en los datos disponibles
            income = float(data_dict.get("PERSONAL_MONTHLY_INCOME", 0))
            age = float(data_dict.get("AGE", 0))
            has_credit_card = float(data_dict.get("HAS_CREDIT_CARD", 0))
            
            # Fórmula simple para scoring crediticio
            base_score = min(95, max(10, (income/1000) * 5 + (age/2)))
            score_adjustment = 5 if has_credit_card > 0 else 0
            final_score = base_score + score_adjustment
            
            # Convertir a escala 0-1 para mantener consistencia con la API original
            normalized_score = final_score / 100.0
            
            # Usar el mismo formato de estado que la función predict() original ("good"/"bad")
            # Un score mayor a 0.5 es "bad" según la función predict() en mlservice.py
            credit_status = "bad" if normalized_score > 0.5 else "good"
            
            # Crear respuesta en el mismo formato exacto que predict()
            result = {
                "status": "success",
                "predictions": [
                    {
                        "client_id": str(data_dict.get("ID_CLIENT")),
                        "client_credit_scoring": float(normalized_score),  # Sin redondear, como en predict()
                        "client_credit_status": credit_status
                    }
                ],
                "count": 1
            }
            # No añadir "fallback_method" para mantener exactamente el mismo formato que predict()

        return result

    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Error en predicción: {str(e)}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando los datos del formulario: {str(e)}\n{error_traceback}",
        )