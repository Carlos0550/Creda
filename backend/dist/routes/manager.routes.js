"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = __importDefault(require("validator"));
const manager_controller_1 = require("../controllers/ManagerController/manager.controller");
const usersRouter = (0, express_1.Router)();
const CreateManager = async (req, res, next) => {
    const { manager_name, manager_email, manager_password } = req.body;
    if (!manager_name || !manager_email || !manager_password) {
        res.status(400).json({
            msg: "Todos los campos son obligatorios"
        });
        return;
    }
    if (manager_password.trim().length < 6) {
        res.status(400).json({
            msg: "La contraseña debe tener al menos 6 caracteres"
        });
        return;
    }
    if (!validator_1.default.isEmail(manager_email)) {
        res.status(400).json({
            msg: "El email ingresado no es valido"
        });
        return;
    }
    next();
};
const LoginManager = async (req, res, next) => {
    const { manager_email, manager_password } = req.body;
    if (!manager_email || !manager_password) {
        res.status(400).json({
            msg: "Todos los campos son obligatorios"
        });
        return;
    }
    if (!validator_1.default.isEmail(manager_email)) {
        res.status(400).json({
            msg: "El email ingresado no es válido."
        });
        return;
    }
    next();
};
const VerifyEmail = async (req, res, next) => {
    const { manager_id } = req.query;
    if (!manager_id) {
        res.status(400).json({
            msg: "Enlace de verificación no valido."
        });
        return;
    }
    next();
};
usersRouter.post("/create-manager", CreateManager, manager_controller_1.CreateManagerController);
usersRouter.get("/login-manager", LoginManager, manager_controller_1.LoginManagerController);
usersRouter.get("/verify-email", VerifyEmail, manager_controller_1.VerifyEmailController);
exports.default = usersRouter;
