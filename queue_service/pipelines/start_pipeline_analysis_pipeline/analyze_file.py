import pandas as pd
import logging

logger = logging.getLogger(__name__)
def file_analysis(file_path):
    try:
        df = pd.read_csv(file_path)
        
        
        records = {
            "columns": df.columns.to_list(),
            "columns_count": len(df.columns),
            "sample_data": df.head(3).to_dict(orient="records"),
            "null_summary":  df.isnull().sum().to_dict()
        }

        return records
    except Exception as e:
        logger.debug(f"❌ Error al analizar el archivo {file_path}: {e}")
        return []