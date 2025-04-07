// src/index.ts
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path"

import pool from "./connections/database_conn";
import redis from "./connections/redis_conn";
import usersRouter from "./routes/users.routes";
import predictRouter from "./routes/predict.routes";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const testPostgresConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT VERSION()");
    console.log("✅ PostgreSQL:", result.rows[0]);
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

const testRedisConnection = async () => {
  try {
    await redis.set("test_key", "Redis andando....", "EX", 5);
    const valor = await redis.get("test_key");
    console.log("✅ Valor desde Redis:", valor);
  } catch (error) {
    console.log("❌ Error al iniciar la conexión a Redis:", error);
  }
};

testPostgresConnection();
testRedisConnection();

app.get("/", (req: Request, res: Response) => {
  res.send("SERVER ON");
});

app.use("/users", usersRouter)
app.use("/predict", predictRouter)
app.use("/download-files", express.static(path.join(__dirname, "uploads")))

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server listening on port ${process.env.PORT || 5000}`);
});
