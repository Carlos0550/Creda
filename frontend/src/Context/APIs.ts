export const base_url_server = new URL("http://localhost:5000/api")
export const globalApis = {
    users: new URL(base_url_server + "/managers"),
    /* predict: new URL(base_url_server + "predict"), */
}