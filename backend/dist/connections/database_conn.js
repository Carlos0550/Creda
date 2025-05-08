"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: "localhost",
    database: "Creda",
    user: "postgres",
    password: "35218889"
});
exports.default = pool;
