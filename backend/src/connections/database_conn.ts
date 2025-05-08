const { Pool } = require("pg")

const pool = new Pool({
    host: process.env.DATABASE_HOST || "localhost",
    database: process.env.DATABASE_NAME || "Creda",
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "35218889",
    port: process.env.DATABASE_PORT || 5432
  });

export default pool