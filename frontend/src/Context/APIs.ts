export const base_url_server = new URL("http://localhost:5000/api")
export const url_predict = new URL("http://localhost:8000/predict")
export const globalApis = {
    users: new URL(base_url_server + "/managers"),
    clients: new URL(base_url_server + "/clients"),
    getClientData: (clientId: string) => 
        `${base_url_server.toString()}/clients/get-client-data?client_id=${clientId}`
}