from config import backend_url
import requests
import logging
logger = logging.getLogger(__name__)

def get_pending_files():
    try:
        logger.debug(f"Consultando pendientes en: {backend_url}/predict/file-status")
        response = requests.get(f"{backend_url}/predict/file-status", params={"status": "pending"})

        if response.status_code == 404:
            logger.debug("No hay archivos pendientes. Continuando con archivos bloqueados...")
        else:
            response.raise_for_status()
            data = response.json()
            archivos_pendientes = data.get("archivos", [])
            if archivos_pendientes:
                logger.debug("Archivos pendientes encontrados, bloqueando...")
                lock = requests.post(f"{backend_url}/predict/lock-pending")
                lock.raise_for_status()

    except requests.RequestException as e:
        logger.debug(f"Error consultando pendientes: {e}")

    try:
        logger.debug(f"Consultando bloqueados en: {backend_url}/predict/file-status")
        response_locked = requests.get(f"{backend_url}/predict/file-status", params={"status": "locked"})
        response_locked.raise_for_status()
        data_locked = response_locked.json()
        archivos_bloqueados = data_locked.get("archivos", [])
        return archivos_bloqueados

    except requests.RequestException as e:
        logger.debug(f"❌ Error consultando archivos bloqueados: {e}")
        return []
