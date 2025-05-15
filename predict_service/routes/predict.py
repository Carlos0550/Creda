from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import os
import requests
from tempfile import NamedTemporaryFile
from model.model_instance import model
from model.mlservice import predict

router = APIRouter()

# URL del servicio de backend (ajusta según tu configuración de Docker)
BACKEND_URL = "http://backend:5000/api/clients/create-client"
BACKEND_URL_DELETE = "http://backend:5000/api/clients/test/delete-all-clients"
# Para pruebas locales usa: "http://localhost:5000/api/clients/create-client"


@router.post("/predict")
async def predict_endpoint(
    file: UploadFile = File(...),
    save_to_db: bool = True,  # Parámetro opcional para guardar en BD
    delete_existing: bool = False,  # Parámetro para eliminar todos los clientes primero
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

