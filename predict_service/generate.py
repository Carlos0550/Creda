import os
import pandas as pd
import numpy as np
from model.preprocessing import predictions_data, preprocess_data
from sklearn.model_selection import train_test_split


def prepare_data_for_training(X):
    """Versión específica para generate.py que produce el formato exacto deseado"""

    # 1. Copiar datos para no modificar original
    X_processed = X.copy()

    # 2. Identificar columnas numéricas y categóricas
    num_cols = X_processed.select_dtypes(include=["int64", "float64"]).columns
    cat_cols = X_processed.select_dtypes(include=["object", "category"]).columns

    # 3. Imputar valores faltantes
    # Para columnas numéricas: mediana
    for col in num_cols:
        if X_processed[col].isnull().any():
            X_processed[col] = X_processed[col].fillna(X_processed[col].median())

    # Para columnas categóricas: valor más frecuente
    for col in cat_cols:
        if X_processed[col].isnull().any():
            X_processed[col] = X_processed[col].fillna(
                "nan"
            )  # Usar 'nan' como categoría

    # 4. One-hot encoding para columnas específicas
    columns_to_onehot = [
        "APPLICATION_SUBMISSION_TYPE",
        "SEX",
        "STATE_OF_BIRTH",
        "CITY_OF_BIRTH",
        "RESIDENCIAL_STATE",
        "RESIDENCIAL_CITY",
        "RESIDENCIAL_ZIP_3",
        "COMPANY",
    ]

    # 5. Escalar columnas numéricas entre 0-1
    for col in num_cols:
        col_min = X_processed[col].min()
        col_max = X_processed[col].max()
        if col_max > col_min:  # Evitar división por cero
            X_processed[col] = (X_processed[col] - col_min) / (col_max - col_min)

    # 6. Convertir columnas binarias a 0-1
    binary_cols = [
        "FLAG_RESIDENCIAL_PHONE",
        "FLAG_EMAIL",
        "FLAG_VISA",
        "FLAG_MASTERCARD",
        "FLAG_OTHER_CARDS",
        "HAS_CREDIT_CARD",
        "COMPANY",  # Añadir esta columna si contiene Y/N
    ]

    for col in binary_cols:
        if col in X_processed.columns:
            # Manejar diferentes formatos de datos binarios
            if X_processed[col].dtype == object:  # Si son strings
                # Convertir 'Y', 'Yes', etc. a 1, y otros valores a 0
                X_processed[col] = X_processed[col].map(
                    lambda x: 1 if str(x).upper() in ["Y", "YES", "TRUE", "1"] else 0
                )
            elif X_processed[col].dtype == bool:
                # Convertir booleanos a enteros
                X_processed[col] = X_processed[col].astype(int)
            else:
                # Asegurar que cualquier valor numérico sea 0 o 1
                X_processed[col] = X_processed[col].clip(0, 1).astype(int)

    # 7. Aplicar one-hot encoding manteniendo valor 'nan'
    for col in columns_to_onehot:
        if col in X_processed.columns:
            # Obtener dummies y asegurar que se incluyan nulos
            dummies = pd.get_dummies(X_processed[col], prefix=col)

            # Eliminar columna original y agregar dummies
            X_processed = X_processed.drop(col, axis=1)
            X_processed = pd.concat([X_processed, dummies], axis=1)

    # 8. Asegurarse de que todos los valores sean numéricos (no booleanos)
    for col in X_processed.columns:
        if X_processed[col].dtype == bool:
            X_processed[col] = X_processed[col].astype(int)

    print(f"Datos procesados: {X_processed.shape[1]} características")
    return X_processed


def generate_training_files():
    """
    Genera los archivos X_train_preprocessed.csv, y_train_values.csv, X_test_preprocessed.csv y y_test_values.csv
    a partir de PAKDD2010_Modeling_Data.csv y los guarda en la carpeta train_dataset.
    """
    # Configurar rutas
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, "PAKDD2010_Modeling_Data.csv")
    output_dir = os.path.join(base_dir, "train_dataset")

    # Crear carpeta de salida si no existe
    os.makedirs(output_dir, exist_ok=True)

    print(f"Leyendo archivo original: {input_file}")

    # Leer datos originales
    try:
        raw_data = pd.read_csv(input_file, low_memory=False)
        print(
            f"Datos cargados: {raw_data.shape[0]} filas y {raw_data.shape[1]} columnas"
        )
    except Exception as e:
        print(f"Error al leer el archivo CSV: {e}")
        return

    # Paso 1: Aplicar preprocesamiento inicial y selección de características
    print("Aplicando preprocesamiento inicial...")
    try:
        # Obtener datos procesados
        modeling_data, id_clients = predictions_data(raw_data)

        # Verificar columnas esperadas
        expected_columns = [
            "PAYMENT_DAY",
            "APPLICATION_SUBMISSION_TYPE",
            "SEX",
            "MARITAL_STATUS",
            "QUANT_DEPENDANTS",
            "STATE_OF_BIRTH",
            "CITY_OF_BIRTH",
            "RESIDENCIAL_STATE",
            "RESIDENCIAL_CITY",
            "FLAG_RESIDENCIAL_PHONE",
            "RESIDENCE_TYPE",
            "MONTHS_IN_RESIDENCE",
            "FLAG_EMAIL",
            "TOTAL_MONTHLY_INCOME",
            "QUANT_BANKING_ACCOUNTS",
            "QUANT_SPECIAL_BANKING_ACCOUNTS",
            "PERSONAL_ASSETS_VALUE",
            "QUANT_CARS",
            "COMPANY",
            "PROFESSION_CODE",
            "OCCUPATION_TYPE",
            "FLAG_VISA",
            "FLAG_MASTERCARD",
            "FLAG_OTHER_CARDS",
            "PRODUCT",
            "AGE",
            "RESIDENCIAL_ZIP_3",
            "HAS_CREDIT_CARD",
            "TARGET_LABEL_BAD=1",
        ]

        for col in expected_columns:
            if col != "TARGET_LABEL_BAD=1" and col not in modeling_data.columns:
                print(
                    f"⚠️ Advertencia: Columna esperada '{col}' no encontrada en los datos"
                )

        # Separar X e y
        X = modeling_data.drop("TARGET_LABEL_BAD=1", axis=1)
        y = modeling_data["TARGET_LABEL_BAD=1"]

        # Dividir en conjuntos de entrenamiento (80%) y prueba (20%)
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,  # 20% para pruebas
            random_state=42,  # Semilla para reproducibilidad
            stratify=y,  # Mantener la proporción de clases
        )

        print(
            f"División de datos: {len(X_train)} muestras para entrenamiento, {len(X_test)} para pruebas"
        )

        # Preparar datos con formato esperado exacto
        X_processed = prepare_data_for_training(
            X_train
        )  # Procesar solo los datos de entrenamiento

        # Guardar archivos
        x_train_path = os.path.join(output_dir, "X_train_preprocessed.csv")
        y_train_path = os.path.join(output_dir, "y_train_values.csv")
        x_test_path = os.path.join(output_dir, "X_test_preprocessed.csv")
        y_test_path = os.path.join(output_dir, "y_test_values.csv")

        # Guardar datos de entrenamiento
        X_processed.to_csv(x_train_path, index=False)
        y_train.to_csv(y_train_path, index=False)

        # Procesar y guardar datos de prueba
        X_test_processed = prepare_data_for_training(X_test)
        X_test_processed.to_csv(x_test_path, index=False)
        y_test.to_csv(y_test_path, index=False)

        print("✅ Columnas en el archivo generado:")
        print(f"   {X_processed.columns.tolist()}")
        print(f"✅ Archivos generados exitosamente:")
        print(
            f"   - X_train_preprocessed.csv: {X_processed.shape[0]} filas, {X_processed.shape[1]} columnas"
        )
        print(f"   - y_train_values.csv: {y_train.shape[0]} filas, 1 columna")
        print(
            f"   - X_test_preprocessed.csv: {X_test_processed.shape[0]} filas, {X_test_processed.shape[1]} columnas"
        )
        print(f"   - y_test_values.csv: {y_test.shape[0]} filas, 1 columna")
        print(f"   - Ubicación: {output_dir}")

    except Exception as e:
        print(f"Error en el procesamiento: {e}")
        import traceback

        traceback.print_exc()


def compare_files():
    """
    Compara las columnas y filas entre el archivo original y el archivo transformado.
    """
    original = pd.read_csv("PAKDD2010_Modeling_Data.csv", low_memory=False)

    # Verificar primero si el archivo existe
    output_path = "train_dataset/X_train_preprocessed.csv"
    if os.path.exists(output_path):
        transformado = pd.read_csv(output_path)
        print(f"Columnas originales: {len(original.columns)}")
        print(f"Columnas transformadas: {len(transformado.columns)}")
        print(
            f"Filas originales: {len(original)}, Filas transformadas: {len(transformado)}"
        )
    else:
        print(
            f"❌ El archivo {output_path} no existe. La transformación no fue exitosa."
        )


if __name__ == "__main__":
    generate_training_files()
    compare_files()
    print("\nProceso completado. Ahora puedes ejecutar tu aplicación FastAPI.")
