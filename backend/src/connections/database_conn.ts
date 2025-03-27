const { Pool } = require("pg")

const pool = new Pool({
    host: "localhost",
    database: "Creda",
    user: "postgres",
    password: "35218889"
});

export default pool