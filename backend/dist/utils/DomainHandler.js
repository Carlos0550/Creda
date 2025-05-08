"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomain = void 0;
require("dotenv/config");
const nodeEnv = process.env.NODE_ENV;
const domains = {
    production: "https://credabackend-production.up.railway.app/api",
    development: "http://localhost:5000/api",
};
const getDomain = () => {
    return domains[nodeEnv || "development"];
};
exports.getDomain = getDomain;
