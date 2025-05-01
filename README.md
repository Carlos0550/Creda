
# Creda – Sistema de Evaluación de Riesgo Crediticio

Creda es una plataforma basada en microservicios para el análisis de riesgo financiero en tiempo real. Los usuarios cargan datasets, que son procesados por un sistema de colas, evaluados mediante modelos de Machine Learning y presentados a través de un frontend moderno.

## 🧱 Estructura del Proyecto

- **frontend/**: Aplicación web desarrollada con Vite + React.
- **backend/**: API Gateway y servicio principal en Node.js + Express.
- **predict_service/**: Microservicio en Python con FastAPI que entrena y ejecuta modelos ML.
- **queue_service/**: Microservicio en Python que gestiona la cola de procesamiento con Redis y ejecuta pipelines.

---

## ⚙️ Requisitos Generales

- Docker (opcional si usás `docker-compose.yml`)
- Node.js ≥ 18
- Python ≥ 3.10
- Redis (si se corre sin Docker)
- PostgreSQL (para persistencia del backend)

---

## 🚀 Instalación y ejecución por servicio

### 1. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- Corre en `http://localhost:5173` por defecto.
---

### 2. Backend (Node.js + Express)

```bash
cd backend
npm install
npm run dev
```

- Puerto por defecto: `http://localhost:3000`
- Se conecta a Redis y orquesta las peticiones al `queue_service` y `predict_service`.

---

### 3. Predict Service (Python + FastAPI)

```bash
cd predict_service
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn __main__:app --reload --host 0.0.0.0 --port 8001
```

- Expone una API para recibir archivos y devolver predicciones.
- Usa modelos como LightGBM entrenados al vuelo.

---

### 4. Queue Service (Python + Redis)

```bash
cd queue_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

- Conecta con Redis para procesar jobs pendientes.
- Ejecuta pipelines definidos para limpieza y análisis de datos.

## 📁 Estructura base

```
Creda/
├── backend/
├── frontend/
├── predict_service/
└── queue_service/
```

