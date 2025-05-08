"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailController = exports.LoginManagerController = exports.CreateManagerController = void 0;
const database_conn_1 = __importDefault(require("../../connections/database_conn"));
const PasswordSecurity_1 = require("../../Security/PasswordSecurity");
const QueriesHandler_1 = require("../../utils/QueriesHandler");
const path_1 = __importDefault(require("path"));
const SendEmailVerification_1 = require("../../utils/EmailVerification/SendEmailVerification");
const queriesFolder = path_1.default.join(__dirname, "./Queries");
const CreateManagerController = async (req, res) => {
    const { manager_name, manager_email, manager_password } = req.body;
    const hashedPsw = await (0, PasswordSecurity_1.getHashPassword)(manager_password);
    const { "createManager.sql": CMQueries } = (0, QueriesHandler_1.getQueries)(queriesFolder);
    if (!CMQueries) {
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        });
        console.log("Error en manager.controller.ts: No se encontraron las Queries");
        return;
    }
    let client;
    try {
        client = await database_conn_1.default.connect();
        await client.query("BEGIN");
        const result1 = await client.query(CMQueries[0], [
            manager_email
        ]);
        if (result1.rows[0].count > 0) {
            throw new Error("El email ingresado ya se encuentra registrado.");
        }
        const result2 = await client.query(CMQueries[1], [
            manager_name,
            manager_email,
            hashedPsw
        ]);
        if (result2.rowCount > 0) {
            await (0, SendEmailVerification_1.sendEmail)({
                to: manager_email,
                subject: "Bienvenido a Creda!",
                user_name: manager_name,
                user_id: result2.rows[0].manager_id
            });
            res.status(200).json({
                msg: "Administrador creado con exito, se le envió un correo de validación."
            });
            await client.query("COMMIT");
            return;
        }
        throw new Error("Ocurrió un error inesperado al crear el administrador, intente nuevamente.");
    }
    catch (error) {
        console.log(error);
        client && await client.query("ROLLBACK");
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        });
    }
    finally {
        client && client.release();
    }
};
exports.CreateManagerController = CreateManagerController;
const LoginManagerController = async (req, res) => {
    const { manager_email, manager_password } = req.query;
    const { "loginManager.sql": LMQueries } = (0, QueriesHandler_1.getQueries)(queriesFolder);
    if (!LMQueries) {
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        });
        console.log("Error en manager.controller.ts: No se encontraron las Queries");
        return;
    }
    let client;
    try {
        client = await database_conn_1.default.connect();
        const result1 = await client.query(LMQueries[0], [
            manager_email
        ]);
        if (result1.rows[0].count === "0") {
            res.status(404).json({
                msg: "El email ingresado no existe, verifique que el email sea el correcto."
            });
            return;
        }
        const result2 = await client.query(LMQueries[1], [
            manager_email,
        ]);
        const manager = result2.rows[0];
        if (manager.manager_verified === false) {
            res.status(404).json({
                msg: "Su cuenta no ha sido verificada, revise la casilla de spam si no lo ha recibido."
            });
            await (0, SendEmailVerification_1.sendEmail)({
                to: manager_email,
                subject: "Bienvenido a Creda!",
                user_name: manager.manager_name,
                user_id: manager.manager_id
            });
            return;
        }
        const isPswCorrect = await (0, PasswordSecurity_1.comparePassword)(manager_password, manager.manager_password);
        if (!isPswCorrect) {
            res.status(404).json({
                msg: "La contraseña ingresada es incorrecta, verifique que la contraseña sea la correcta."
            });
            return;
        }
        const { manager_password: _, ...rest } = manager;
        res.status(200).json({
            msg: "Administrador logueado con exito!",
            manager: rest
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        });
    }
    finally {
        client && client.release();
    }
};
exports.LoginManagerController = LoginManagerController;
const VerifyEmailController = async (req, res) => {
    const { manager_id } = req.query;
    let client;
    try {
        client = await database_conn_1.default.connect();
        const result = await client.query("UPDATE managers SET manager_verified = true WHERE manager_id = $1", [
            manager_id
        ]);
        if (result.rowCount > 0) {
            res.status(200).json({
                msg: "El correo fue verificado con exito."
            });
            return;
        }
        else {
            res.status(400).json({
                msg: "El correo no pudo ser verificado."
            });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        });
        return;
    }
};
exports.VerifyEmailController = VerifyEmailController;
