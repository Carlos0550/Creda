"""
Punto central para cargar el modelo una sola vez y hacerlo disponible 
para toda la aplicación.
"""
import logging

logger = logging.getLogger("creda-api")

# Importa la función load_model
from .mlservice import load_model

# Carga el modelo una sola vez al importar este módulo
logger.info("Cargando modelo...")
try:
    model = load_model()
    logger.info("Modelo cargado exitosamente")
except Exception as e:
    logger.error(f"Error al cargar el modelo: {str(e)}")
    model = None