export const base_url_server = new URL("https://creda-development.up.railway.app/api")
export const url_predict = new URL("http://localhost:8000/predict?save_to_db=true")
export const url_predictform = new URL("http://localhost:8000/predict-form")
export const globalApis = {
    users: new URL(base_url_server + "/managers"),
    clients: new URL(base_url_server + "/clients"),
    getClientData: (clientId: string) => 
        `${base_url_server.toString()}/clients/get-client-data?client_id=${clientId}`
}