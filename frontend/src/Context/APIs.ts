export const base_url_server = new URL("https://creda-development.up.railway.app/api") //http://localhost:5000/api
export const base_url_predict = new URL("http://localhost:8000")

// URLs del servicio de predicción original (síncrono)
export const url_predict = new URL("predict?save_to_db=true&delete_existing=true", base_url_predict)
export const url_predictform = new URL("predict-form", base_url_predict)

// URLs del servicio de predicción asíncrono
export const prediction_endpoints = {
  startPrediction: new URL(`${base_url_server}/predictions/start-prediction`),
  getPredictionStatus: (predictionId: string) => 
    new URL(`${base_url_server}/predictions/prediction-status?prediction_id=${predictionId}`)
}

export const globalApis = {
    users: new URL(base_url_server + "/managers"),
    clients: new URL(base_url_server + "/clients"),
    getClientData: (clientId: string) => 
        `${base_url_server.toString()}/clients/get-client-data?client_id=${clientId}`
}