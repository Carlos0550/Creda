export const base_url_server = new URL("https://creda-development.up.railway.app/api")
export const globalApis = {
    users: new URL(base_url_server + "/managers"),
    /* predict: new URL(base_url_server + "predict"), */
}