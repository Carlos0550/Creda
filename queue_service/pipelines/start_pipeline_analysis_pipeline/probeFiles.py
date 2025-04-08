from config import backend_url
import requests

def get_pending_files():
    try:
        print(f"Consultando pendientes en: {backend_url}/predict/file-status")
        response = requests.get(f"{backend_url}/predict/file-status", params={"status": "pending"})

        if response.status_code == 404:
            print("No hay archivos pendientes. Continuando con archivos bloqueados...")
        else:
            response.raise_for_status()
            data = response.json()
            archivos_pendientes = data.get("archivos", [])
            if archivos_pendientes:
                print("Archivos pendientes encontrados, bloqueando...")
                lock = requests.post(f"{backend_url}/predict/lock-pending")
                lock.raise_for_status()

    except requests.RequestException as e:
        print(f"Error consultando pendientes: {e}")

    try:
        print(f"Consultando bloqueados en: {backend_url}/predict/file-status")
        response_locked = requests.get(f"{backend_url}/predict/file-status", params={"status": "locked"})
        response_locked.raise_for_status()
        data_locked = response_locked.json()
        archivos_bloqueados = data_locked.get("archivos", [])
        return archivos_bloqueados

    except requests.RequestException as e:
        print(f"❌ Error consultando archivos bloqueados: {e}")
        return []
