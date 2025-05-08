"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_conn_1 = __importDefault(require("./connections/database_conn"));
const redis_conn_1 = __importDefault(require("./connections/redis_conn"));
const manager_routes_1 = __importDefault(require("./routes/manager.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const testPostgresConnection = async () => {
    let client;
    try {
        client = await database_conn_1.default.connect();
        const result = await client.query("SELECT VERSION()");
        console.log("✅ PostgreSQL:", result.rows[0]);
    }
    catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
        process.exit(1);
    }
    finally {
        if (client)
            client.release();
    }
};
const testRedisConnection = async () => {
    try {
        await redis_conn_1.default.set("test_key", "Redis andando....", "EX", 5);
        const valor = await redis_conn_1.default.get("test_key");
        console.log("✅ Valor desde Redis:", valor);
    }
    catch (error) {
        console.log("❌ Error al iniciar la conexión a Redis:", error);
    }
};
testPostgresConnection();
testRedisConnection();
app.get("/", (req, res) => {
    res.send("SERVER ON");
});
app.use("/api/managers", manager_routes_1.default);
app.listen(5000, () => {
    console.log(`🚀 Server listening on port ${5000}`);
});
