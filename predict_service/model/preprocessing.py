from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV
from sklearn.utils.validation import check_is_fitted

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from typing import Tuple, List
from sklearn.preprocessing import OrdinalEncoder, OneHotEncoder, MinMaxScaler
from sklearn.impute import SimpleImputer


def predictions_data(modeling_data, is_prediction=False):
    id_clients = (
        modeling_data["ID_CLIENT"]
        if "ID_CLIENT" in modeling_data.columns
        else range(len(modeling_data))
    )

    # Eliminar columnas innecesarias
    modeling_data["HAS_CREDIT_CARD"] = modeling_data[
        [
            "FLAG_VISA",
            "FLAG_MASTERCARD",
            "FLAG_DINERS",
            "FLAG_AMERICAN_EXPRESS",
            "FLAG_OTHER_CARDS",
        ]
    ].max(axis=1)

    # Columnas a lower
    cols_to_lower = [
        "CITY_OF_BIRTH",
        "RESIDENCIAL_CITY",
        "RESIDENCIAL_BOROUGH",
        "PROFESSIONAL_CITY",
        "PROFESSIONAL_BOROUGH",
    ]

    for col in cols_to_lower:
        if col in modeling_data.columns:
            modeling_data[col] = modeling_data[col].apply(
                lambda x: x.lower() if isinstance(x, str) else x
            )

    # Remplazamos la pseudo missing data
    def replace_pseudo_missing(
        df: pd.DataFrame, targets: list = ["0", "", " ", "NaN", "None"]
    ) -> pd.DataFrame:
        df = df.copy()
        for col in df.columns:
            if pd.api.types.is_object_dtype(
                df[col]
            ) or pd.api.types.is_categorical_dtype(df[col]):
                df[col] = df[col].replace(targets, np.nan)
            elif pd.api.types.is_numeric_dtype(df[col]):
                # Solo reemplazar 0 por NaN si es común (pseudo-missing)
                zero_ratio = (df[col] == 0).sum() / len(df)
                if zero_ratio > 0.99:
                    df[col] = df[col].replace(0, np.nan)
        return df

    modeling_data = replace_pseudo_missing(modeling_data)

    # Agrupamos por el top k de catregorias
    def group_top_categories(
        df: pd.DataFrame, col: str, top_k: int = 100, other_label: str = "otros"
    ) -> pd.Series:
        col_as_str = df[col].astype(str)
        top_values = col_as_str.value_counts().nlargest(top_k).index
        return col_as_str.apply(lambda x: x if x in top_values else other_label)

    modeling_data["RESIDENCIAL_CITY"] = group_top_categories(
        modeling_data, "RESIDENCIAL_CITY", top_k=40
    )
    modeling_data["RESIDENCIAL_ZIP_3"] = group_top_categories(
        modeling_data, "RESIDENCIAL_ZIP_3", top_k=40
    )
    modeling_data["RESIDENCIAL_PHONE_AREA_CODE"] = group_top_categories(
        modeling_data, "RESIDENCIAL_PHONE_AREA_CODE", top_k=40
    )
    modeling_data["CITY_OF_BIRTH"] = group_top_categories(
        modeling_data, "CITY_OF_BIRTH", top_k=40
    )

    # Sumamos los ingresos totales
    modeling_data["TOTAL_MONTHLY_INCOME"] = (
        modeling_data["PERSONAL_MONTHLY_INCOME"] + modeling_data["OTHER_INCOMES"]
    )

    # Manejo de outlier de quant dependants
    modeling_data = modeling_data[modeling_data["QUANT_DEPENDANTS"] < 50]

    # Nos quedamos con las features importantes
    selected_features_final = [
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
    ]

    target_variable = "TARGET_LABEL_BAD=1"

    # Crear dataset reducido según si es predicción o no
    if not is_prediction and target_variable in modeling_data.columns:
        selected_features_with_target = selected_features_final + [target_variable]
    else:
        selected_features_with_target = selected_features_final

    # Seleccionar solo columnas que realmente existen en el DataFrame
    existing_columns = [
        col for col in selected_features_with_target if col in modeling_data.columns
    ]
    modeling_data = modeling_data[existing_columns].copy()

    return modeling_data, id_clients


def preprocess_data(
    X_train: pd.DataFrame, is_prediction: bool = False
) -> Tuple[np.ndarray]:
    """
    Preprocesa los datos para entrenamiento o predicción.

    Args:
        X_train: DataFrame con los datos a preprocesar
        is_prediction: Si es True, estamos en modo predicción (sin column target)
    """
    print("Input train shape:", X_train.shape)

    # Copias
    train_df = X_train.copy()

    # Verificar si estamos en modo predicción y si falta la columna target
    target_col = "TARGET_LABEL_BAD=1"
    target_data = None

    if not is_prediction and target_col in train_df.columns:
        # Estamos en modo de entrenamiento, guardamos el target y continuamos
        target_data = train_df[target_col].copy()
        print(f"Target column found with {target_data.sum()} positive examples.")
    elif is_prediction and target_col not in train_df.columns:
        # Estamos en modo predicción, no necesitamos la columna target
        print("Running in prediction mode, no target column expected.")
    else:
        # Mensaje informativo por si hay inconsistencias
        print(
            f"Warning: TARGET_LABEL_BAD=1 {'present' if target_col in train_df.columns else 'missing'} in {'prediction' if is_prediction else 'training'} mode."
        )

    # Reemplazo de strings vacíos
    train_df.replace(r"^\s*$", np.nan, regex=True, inplace=True)

    # Convertir columnas categóricas a string
    for col in train_df.select_dtypes(include=["object", "category"]).columns:
        train_df[col] = train_df[col].astype(str)

    # Pasar a lowercase las columnas de ciudad
    for col in ["CITY_OF_BIRTH", "RESIDENCIAL_CITY", "RESIDENCIAL_BOROUGH"]:
        if col in train_df.columns:
            train_df[col] = train_df[col].str.lower()

    # Eliminar columnas dominadas, constantes o todo 0
    drop_cols = []
    for col in train_df.columns:
        if col == target_col:  # Preservar columna target si existe
            continue
        try:
            unique_vals = train_df[col].nunique(dropna=False)
            top_freq = train_df[col].value_counts(normalize=True, dropna=False).max()
            if unique_vals == 1 or top_freq > 0.98:
                drop_cols.append(col)
            elif (train_df[col] == 0).sum() == len(train_df):
                drop_cols.append(col)
        except Exception as e:
            print(f"[WARNING] Skipping column '{col}' during low variance check: {e}")
            continue
    train_df.drop(columns=drop_cols, inplace=True)

    # Eliminar columnas con más del 60% de NaNs
    nan_ratio = train_df.isna().mean()
    drop_cols_nan = nan_ratio[nan_ratio > 0.6].index.tolist()
    if target_col in drop_cols_nan and target_col in train_df.columns:
        drop_cols_nan.remove(target_col)  # No eliminar target si existe
    train_df.drop(columns=drop_cols_nan, inplace=True)

    # ARREGLO: Corregir división train/val (no funcional en tu código original)
    # En vez de dividir, usamos todo el conjunto para continuar el preprocesamiento
    val_df = train_df.copy()  # Solo para compatibilidad con tu código existente

    # Clasificación de variables categóricas
    cat_counts = train_df.select_dtypes(include=["object"]).nunique()
    c_ordinal = cat_counts[cat_counts == 2]
    c_onehot = cat_counts[(cat_counts > 2)]

    print(f"[INFO] Ordinal (2 categorías): {list(c_ordinal.index)}")
    print(f"[INFO] One-hot (3-50 categorías): {list(c_onehot.index)}")

    # Encoders
    ordinal_enc = OrdinalEncoder().set_output(transform="pandas")
    onehot_enc = OneHotEncoder(sparse_output=False, handle_unknown="ignore").set_output(
        transform="pandas"
    )

    if not c_ordinal.empty:
        ordinal_enc.fit(train_df[c_ordinal.index])
    if not c_onehot.empty:
        onehot_enc.fit(train_df[c_onehot.index])

    def encode_df(df):
        x = (
            ordinal_enc.transform(df[c_ordinal.index])
            if not c_ordinal.empty
            else pd.DataFrame()
        )
        y = (
            onehot_enc.transform(df[c_onehot.index])
            if not c_onehot.empty
            else pd.DataFrame()
        )
        cols_to_drop = set(c_ordinal.index).union(set(c_onehot.index))
        if target_col in cols_to_drop and target_col in df.columns:
            cols_to_drop.remove(target_col)  # Preservar target si existe
        df = df.drop(columns=list(cols_to_drop))
        return pd.concat([df, x, y], axis=1)

    train_df = encode_df(train_df)

    # Imputación por mediana
    imp_median = SimpleImputer(strategy="median").set_output(transform="pandas")
    # Solo aplicar a columnas numéricas que no sean el target
    num_cols = train_df.select_dtypes(include=["float64", "int64"]).columns
    if target_col in num_cols and target_col in train_df.columns:
        num_cols = num_cols.drop(target_col)

    if len(num_cols) > 0:  # Solo si hay columnas numéricas
        imp_median.fit(train_df[num_cols])
        train_df[num_cols] = imp_median.transform(train_df[num_cols])

    # Escalado MinMax
    scaler = MinMaxScaler().set_output(transform="pandas")
    # Solo aplicar a columnas numéricas que no sean el target
    num_cols = train_df.select_dtypes(include=["float64", "int64"]).columns
    if target_col in num_cols and target_col in train_df.columns:
        num_cols = num_cols.drop(target_col)

    if len(num_cols) > 0:  # Solo si hay columnas numéricas
        scaler.fit(train_df[num_cols])
        train_df[num_cols] = scaler.transform(train_df[num_cols])

    # IMPORTANTE: Devolver DataFrame en lugar de numpy array
    # para conservar nombres de columnas
    return train_df
