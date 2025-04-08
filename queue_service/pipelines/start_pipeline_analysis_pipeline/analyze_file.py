import pandas as pd

def file_analysis(file_path):
    try:
        df = pd.read_csv(file_path)
        columns = df.columns.to_list()
        print(columns)
        return columns
    except Exception as e:
        print(f"❌ Error al analizar el archivo {file_path}: {e}")
        return []