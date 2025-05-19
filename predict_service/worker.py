import requests
import time
import pandas as pd
import json
from model.model_instance import model
from model.mlservice import predict
import logging
import os
import tempfile

logging.basicConfig(
    format="%(asctime)s [WORKER] %(levelname)s: %(message)s", level=logging.INFO
)
logger = logging.getLogger("worker")

URL_BASE = "https://creda-development.up.railway.app/api"
PREDICTION_PENDING_URL = f"{URL_BASE}/predictions/get-pending-predictions"
PREDICTION_STATUS_URL = f"{URL_BASE}/predictions/prediction-status"
PREDICTION_SAVE_URL = f"{URL_BASE}/predictions/save-prediction"

# Configuration
POLLING_INTERVAL = 10  # seconds

# URLs adicionales para el procesamiento de CSV
CSV_FILES_STATUS_URL = f"{URL_BASE}/clients/get-files-status"
CSV_DOWNLOAD_FILE_URL = f"{URL_BASE}/clients/download-file"
CSV_CREATE_CLIENT_URL = f"{URL_BASE}/clients/create-client"
CSV_DELETE_ALL_CLIENTS_URL = f"{URL_BASE}/clients/test/delete-all-clients"


def get_pending_predictions():
    """Fetch pending predictions from the API"""
    try:
        response = requests.get(PREDICTION_PENDING_URL)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            logger.info("No pending predictions found")
            return {}
        else:
            logger.error(f"Failed to get pending predictions: {response.status_code}")
            return {}
    except Exception as e:
        logger.error(f"Error fetching pending predictions: {e}")
        return {}


def process_prediction(prediction_data):
    """Process a single prediction using the loaded model"""
    try:
        # Remove non-feature fields from the data
        prediction_id = prediction_data.get("prediction_id", "")
        non_feature_fields = ["prediction_id", "status", "created_at"]
        features = {
            k: v for k, v in prediction_data.items() if k not in non_feature_fields
        }

        # Create DataFrame from features
        df = pd.DataFrame([features])

        # Ensure ID_CLIENT is string if present
        if "ID_CLIENT" in df.columns:
            df["ID_CLIENT"] = df["ID_CLIENT"].astype(str)

        # Calculate HAS_CREDIT_CARD as maximum of card flags
        card_flags = [
            "FLAG_VISA",
            "FLAG_MASTERCARD",
            "FLAG_DINERS",
            "FLAG_AMERICAN_EXPRESS",
            "FLAG_OTHER_CARDS",
        ]
        if all(flag in df.columns for flag in card_flags):
            df["HAS_CREDIT_CARD"] = df[card_flags].max(axis=1)

        # Convert necessary fields to numeric
        numeric_columns = [
            "PAYMENT_DAY",
            "POSTAL_ADDRESS_TYPE",
            "MARITAL_STATUS",
            "QUANT_DEPENDANTS",
            "EDUCATION_LEVEL",
            "NACIONALITY",
            "RESIDENCIAL_PHONE_AREA_CODE",
            "RESIDENCE_TYPE",
            "MONTHS_IN_RESIDENCE",
            "FLAG_EMAIL",
            "PERSONAL_MONTHLY_INCOME",
            "OTHER_INCOMES",
            "FLAG_VISA",
            "FLAG_MASTERCARD",
            "FLAG_DINERS",
            "FLAG_AMERICAN_EXPRESS",
            "FLAG_OTHER_CARDS",
            "QUANT_BANKING_ACCOUNTS",
            "QUANT_SPECIAL_BANKING_ACCOUNTS",
            "PERSONAL_ASSETS_VALUE",
            "QUANT_CARS",
            "PROFESSIONAL_PHONE_AREA_CODE",
            "MONTHS_IN_THE_JOB",
            "PROFESSION_CODE",
            "OCCUPATION_TYPE",
            "FLAG_HOME_ADDRESS_DOCUMENT",
            "FLAG_RG",
            "FLAG_CPF",
            "FLAG_INCOME_PROOF",
            "PRODUCT",
            "AGE",
            "RESIDENCIAL_ZIP_3",
            "PROFESSIONAL_ZIP_3",
            "HAS_CREDIT_CARD",
        ]

        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # Calculate TOTAL_MONTHLY_INCOME
        if "PERSONAL_MONTHLY_INCOME" in df.columns and "OTHER_INCOMES" in df.columns:
            df["TOTAL_MONTHLY_INCOME"] = (
                df["PERSONAL_MONTHLY_INCOME"] + df["OTHER_INCOMES"]
            )

        # Convert text columns to lowercase
        text_cols = [
            "CITY_OF_BIRTH",
            "RESIDENCIAL_CITY",
            "RESIDENCIAL_BOROUGH",
            "PROFESSIONAL_CITY",
            "PROFESSIONAL_BOROUGH",
        ]
        for col in text_cols:
            if col in df.columns and df[col].dtype == object:
                df[col] = df[col].str.lower()

        logger.info(
            f"Processing prediction {prediction_id} with {len(df.columns)} columns"
        )

        # Get prediction from model
        try:
            result = predict(model, df)
            logger.info(f"Prediction result status: {result.get('status')}")

            if result.get("status") != "success" or not result.get("predictions"):
                raise ValueError(f"Prediction failed: {result}")

            prediction = result["predictions"][0]
            return {
                "prediction_id": prediction_id,
                "client_score": prediction["client_credit_scoring"],
                "client_credit_status": prediction["client_credit_status"],
                "prediction_result": "completed",
            }

        except Exception as pred_error:
            logger.error(f"Error in model prediction: {str(pred_error)}")

            # Use fallback prediction method as in original code
            logger.info("Using fallback prediction method")

            # Extract necessary fields for fallback calculation
            income = float(features.get("PERSONAL_MONTHLY_INCOME", 0))
            age = float(features.get("AGE", 0))
            has_credit_card = float(features.get("HAS_CREDIT_CARD", 0))

            # Simple formula for credit scoring
            base_score = min(95, max(10, (income / 1000) * 5 + (age / 2)))
            score_adjustment = 5 if has_credit_card > 0 else 0
            final_score = base_score + score_adjustment

            # Normalize score to 0-1 range
            normalized_score = final_score / 100.0

            # Determine credit status
            credit_status = "bad" if normalized_score > 0.5 else "good"

            return {
                "prediction_id": prediction_id,
                "client_score": normalized_score,
                "client_credit_status": credit_status,
                "prediction_result": "completed",
            }

    except Exception as e:
        logger.error(f"Error processing prediction: {str(e)}", exc_info=True)
        return {
            "prediction_id": prediction_data.get("prediction_id", ""),
            "client_score": 0,
            "client_credit_status": "none",
            "prediction_result": "failed",
        }


def save_prediction_result(result):
    """Save prediction result back to the API"""
    try:
        logger.info(f"Saving result for prediction {result['prediction_id']}")
        response = requests.post(PREDICTION_SAVE_URL, json=result)
        if response.status_code == 200:
            logger.info(f"Successfully saved prediction {result['prediction_id']}")
            return True
        else:
            logger.error(
                f"Failed to save prediction: {response.status_code} - {response.text}"
            )
            return False
    except Exception as e:
        logger.error(f"Error saving prediction: {str(e)}", exc_info=True)
        return False


def get_pending_csv_files():
    """Obtiene archivos CSV pendientes de procesamiento"""
    try:
        logger.info("Verificando archivos CSV pendientes...")
        response = requests.get(CSV_FILES_STATUS_URL)

        if response.status_code != 200:
            logger.error(f"Error al obtener estado de archivos: {response.status_code}")
            return []

        files_data = response.json()
        files = files_data.get("files", [])

        # Filtra los archivos que aún no han sido procesados (puedes ajustar la lógica)
        # Aquí asumiremos que todos los archivos están pendientes ya que no hay un campo "processed"
        pending_files = [
            f for f in files if f.get("file_name", "").lower().endswith(".csv")
        ]

        if pending_files:
            logger.info(f"Encontrados {len(pending_files)} archivos CSV pendientes")

        return pending_files

    except Exception as e:
        logger.error(f"Error verificando archivos CSV: {str(e)}", exc_info=True)
        return []


def process_csv_file(file_metadata):
    """Procesa un archivo CSV desde el backend"""
    file_id = file_metadata.get("key")
    file_name = file_metadata.get("file_name")

    if not file_id:
        logger.error("ID de archivo no encontrado en los metadatos")
        return False

    try:
        # Paso 1: Opcionalmente eliminar clientes existentes
        # Descomenta si deseas eliminar todos los clientes antes de procesar
        try:
            logger.info("Eliminando clientes existentes...")
            delete_response = requests.delete(CSV_DELETE_ALL_CLIENTS_URL)

            if delete_response.status_code == 200:
                logger.info("Clientes eliminados correctamente")
            else:
                logger.warning(
                    f"Error al eliminar clientes: {delete_response.status_code}"
                )
        except Exception as e:
            logger.error(f"Error al intentar eliminar clientes: {str(e)}")

        # Paso 2: Descargar el archivo CSV
        logger.info(f"Descargando archivo {file_name} (ID: {file_id})")
        download_response = requests.get(
            f"{CSV_DOWNLOAD_FILE_URL}?file_id={file_id}", stream=True
        )

        if download_response.status_code != 200:
            logger.error(f"Error al descargar archivo: {download_response.status_code}")
            return False

        # Guardar archivo temporalmente
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as temp_file:
            for chunk in download_response.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)
            temp_file_path = temp_file.name

        # Paso 3: Cargar el CSV en un DataFrame
        logger.info(f"Cargando archivo CSV: {temp_file_path}")
        df = pd.read_csv(temp_file_path)
        os.unlink(temp_file_path)  # Eliminar archivo temporal

        if df.empty:
            logger.error("El archivo CSV no contiene datos")
            return False

        logger.info(f"CSV cargado con {len(df)} registros")

        # Paso 4: Usar el modelo para predecir
        result = predict(model, df)

        if result.get("status") != "success":
            logger.error(f"Error en la predicción: {result}")
            return False

        # Paso 5: Guardar los resultados en la base de datos
        saved_count = 0
        errors = []
        predictions = result.get("predictions", [])

        logger.info(f"Procesando {len(predictions)} predicciones para guardar en BD")

        for prediction in predictions:
            try:
                # Adaptar al formato esperado por create-client
                client_data = {
                    "client_id": prediction["client_id"],
                    "client_score": prediction["client_credit_scoring"],
                    "client_credit_status": prediction["client_credit_status"],
                }

                # Llamar al endpoint para crear cliente
                response = requests.post(CSV_CREATE_CLIENT_URL, json=client_data)

                if response.status_code == 200 or response.status_code == 201:
                    saved_count += 1
                else:
                    error_msg = f"Error al guardar cliente {prediction['client_id']}: {response.status_code} - {response.text}"
                    errors.append(error_msg)
                    logger.error(error_msg)

            except Exception as e:
                error_msg = (
                    f"Error al procesar cliente {prediction['client_id']}: {str(e)}"
                )
                errors.append(error_msg)
                logger.error(error_msg)

        # Resumen del procesamiento
        logger.info(
            f"Procesamiento de CSV completado: {saved_count}/{len(predictions)} clientes guardados"
        )
        if errors:
            logger.warning(f"Se produjeron {len(errors)} errores durante el guardado")

        # TODO: Actualizar estado del archivo en Redis si es necesario

        return True

    except Exception as e:
        logger.error(
            f"Error procesando archivo CSV {file_name}: {str(e)}", exc_info=True
        )
        return False


# Modificar la función main para incluir procesamiento de CSV
def main():
    """Main worker loop"""
    logger.info("Starting prediction worker...")

    while True:
        try:
            # Get pending predictions (código existente)
            pending_predictions = get_pending_predictions()

            if pending_predictions:
                count = len(pending_predictions)
                logger.info(f"Found {count} pending predictions")

                for pred_id, prediction_data in pending_predictions.items():
                    # Add prediction_id to the data
                    prediction_data["prediction_id"] = pred_id

                    # Process prediction
                    result = process_prediction(prediction_data)

                    # Save result
                    save_prediction_result(result)
            else:
                logger.info("No pending predictions found")

            # NUEVA FUNCIONALIDAD: Verificar y procesar archivos CSV
            pending_csv_files = get_pending_csv_files()

            for file_metadata in pending_csv_files:
                logger.info(f"Procesando archivo CSV: {file_metadata.get('file_name')}")
                process_csv_file(file_metadata)

            # Wait before next poll
            logger.debug(f"Sleeping for {POLLING_INTERVAL} seconds")
            time.sleep(POLLING_INTERVAL)

        except Exception as e:
            logger.error(f"Error in worker loop: {str(e)}", exc_info=True)
            time.sleep(POLLING_INTERVAL)


if __name__ == "__main__":
    main()
