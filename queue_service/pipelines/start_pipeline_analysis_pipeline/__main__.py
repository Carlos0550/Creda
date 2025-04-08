
import asyncio
import requests

from pipelines.start_pipeline_analysis_pipeline.probeFiles import get_pending_files
from pipelines.start_pipeline_analysis_pipeline.download_files import download_file
from pipelines.start_pipeline_analysis_pipeline.analyze_file import file_analysis
from config import backend_url

POLL_INTERVAL = 10

async def start_pipeline_analysis_pipeline(stop_event: asyncio.Event):
    while not stop_event.is_set():
        try:
            files = get_pending_files()
            if not files:
                print("No hay archivos pendientes.")
                await asyncio.sleep(POLL_INTERVAL)
                continue

            for entry in files:
                filename = entry.get("file")
                print(f"\nProcesando archivo: {filename}")

                file_path = download_file(filename)
                if not file_path:
                    continue

                columns = file_analysis(file_path)
                if not columns:
                    continue

                payload = {
                    "fileName": filename,
                    "columns": columns
                }

                response = requests.post(f"{backend_url}/predict/mark-as-analyzed", json=payload)
                print(response.text)
                response.raise_for_status()
                print(f"Análisis enviado para {filename}")

        except requests.RequestException as e:
            print(f"Error al enviar el análisis: {e}")
            await asyncio.sleep(POLL_INTERVAL)
