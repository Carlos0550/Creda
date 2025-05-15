import xgboost as xgb
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.metrics import make_scorer, recall_score
import pandas as pd
import numpy as np
import os
from .preprocessing import predictions_data, preprocess_data


def load_model():
    """
    Carga el modelo XGBClassifier entrenado con los datos preprocesados.

    Returns:
        model: Modelo entrenado (XGBClassifier)
    """
    # Obtener ruta base del proyecto
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_data_path = os.path.join(
        base_dir, "train_dataset", "X_train_preprocessed.csv"
    )
    y_train_path = os.path.join(base_dir, "train_dataset", "y_train_values.csv")

    train_data = pd.read_csv(train_data_path)
    y_train = pd.read_csv(y_train_path)

    if not isinstance(y_train, np.ndarray):
        if len(y_train.columns) == 1:
            y_train = y_train.values.ravel()

    # Calcular el ratio para balanceo de clases
    if len(np.unique(y_train)) == 2:
        # Balance ratio para clasificación binaria (negativos/positivos)
        neg, pos = np.bincount(y_train.astype(int))
        ratio = neg / pos if pos > 0 else 1.0
    else:
        # Para clasificación multiclase, dejar en 1
        ratio = 1.0

    model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        colsample_bytree=0.8,
        subsample=0.8,
        gamma=0.2,
        min_child_weight=1,
        reg_alpha=0.1,
        reg_lambda=1,
        scale_pos_weight=ratio,
        base_score=0.5,
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
    )
    model.fit(train_data, y_train)
    return model


def predict(model, data):
    """
    Recibe un modelo y un DataFrame, aplica el preprocesamiento necesario,
    y devuelve las predicciones junto con los IDs de clientes.

    Args:
        model: Modelo entrenado (XGBClassifier)
        data: DataFrame con los datos sin procesar

    Returns:
        dict: Diccionario con predicciones y probabilidades por ID de cliente
    """
    try:
        # Paso 1: Aplicar la transformación inicial con predictions_data
        processed_data, id_clients = predictions_data(data, is_prediction=True)

        # Paso 2: Aplicar el preprocesamiento avanzado
        X_processed = preprocess_data(processed_data, is_prediction=True)

        # Añadir validación para verificar la alineación de columnas
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        train_data_path = os.path.join(
            base_dir, "train_dataset", "X_train_preprocessed.csv"
        )
        expected_columns = pd.read_csv(train_data_path).columns.tolist()

        # Comprobar si las columnas coinciden
        missing_cols = [
            col for col in expected_columns if col not in X_processed.columns
        ]
        if missing_cols:
            # Añadir columnas faltantes con ceros
            for col in missing_cols:
                X_processed[col] = 0
            print(f"Se añadieron columnas faltantes: {len(missing_cols)}")

        # Asegurar el mismo orden de columnas que en los datos de entrenamiento
        X_processed = X_processed[expected_columns]

        # Paso 3: Realizar la predicción
        predictions = model.predict_proba(X_processed)[:, 1]

        # Paso 4: Crear respuesta con resultados
        results = []
        for i, prob in enumerate(predictions):
            client_id = i if isinstance(id_clients, int) else id_clients[i]
            results.append(
                {
                    "client_id": str(client_id),
                    "client_credit_scoring": float(prob),
                    "client_credit_status": "good" if prob > 0.5 else "bad",
                }
            )

        return {"status": "success", "predictions": results, "count": len(results)}

    except Exception as e:
        return {"status": "error", "message": str(e)}
