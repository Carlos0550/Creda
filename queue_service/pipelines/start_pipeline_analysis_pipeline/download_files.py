from config import backend_url
import requests
import tempfile
import os

def download_file(filename):
    try:
        response = requests.get(f"{backend_url}/download-files/{filename}")
        response.raise_for_status()

        temp_path = os.path.join(tempfile.gettempdir(), filename)
        with open(temp_path, "wb") as f:
            f.write(response.content)
        return temp_path
    except requests.RequestException as e:
        print(f"Error al descargar el archivo {filename}: {e}")
        return None