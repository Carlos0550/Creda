"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueries = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getQueries = (dir) => {
    const queries = {};
    const folderPath = path_1.default.resolve(__dirname, dir);
    const files = fs_1.default.readdirSync(folderPath);
    const sqlFiles = files.filter((f) => f.endsWith(".sql"));
    for (const file of sqlFiles) {
        const fullPath = path_1.default.join(folderPath, file);
        const content = fs_1.default.readFileSync(fullPath, "utf-8");
        const queryArray = content
            .split(";")
            .map((q) => q.trim())
            .filter((q) => q.length > 0);
        queries[file] = queryArray;
    }
    return queries;
};
exports.getQueries = getQueries;
