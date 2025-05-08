"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.getHashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getHashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(11);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    return hashedPassword;
};
exports.getHashPassword = getHashPassword;
const comparePassword = async (password, hashed) => {
    return await bcryptjs_1.default.compare(password, hashed);
};
exports.comparePassword = comparePassword;
