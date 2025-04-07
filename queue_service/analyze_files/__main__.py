from probeFiles import get_pending_files
from download_files import download_file
from analyze_file import file_analysis
from config import backend_url

import requests 
import time

POLL_INTERVAL = 10


if __name__ == "__main__":
    flag = True
    while(flag):
        try:
            files = get_pending_files()

            if not files:
                print("No hay archivos pendientes.")
            
            for entry in files:
                filename = entry.get("file")
                print(f"\n procesando archivo: {filename}")

                file_path = download_file(filename)
                if not file_path:
                    continue
                columns = file_analysis(file_path)

                if not columns:
                    continue
                try:
                    payload = {
                        "fileName": filename,
                        "columns": columns
                    }

                    response = requests.post(f"{backend_url}/predict/mark-as-analyzed", json=payload)
                    print(response.text)
                    response.raise_for_status()
                    print(f"Análisis enviado para {filename}")
                except requests.RequestException as e:
                    print(f"Error al enviar el análisis de {filename}: {e}")
            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            print("Servicio de analisis de archivos detenido manualmente...")
            flag = False