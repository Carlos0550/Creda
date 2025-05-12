import { RequestHandler, Router } from "express";
import { CreateManager, LoginManager, ResetManagerPassword } from "../Types/manager.types";
import validator from "validator";
import { CreateManagerController, deleteAllManagers, LoginManagerController, resetManagerPassword, sendPasswordResetEmail, VerifyEmailController } from "../controllers/ManagerController/manager.controller";
import path from "path";
import pool from "../connections/database_conn";
import dayjs from "dayjs";

const managerRoutes = Router()

const CreateManagerRouter:RequestHandler<{},{},CreateManager,{}> = async(
    req,
    res,
    next
): Promise<void> => {
    const {
        manager_name,
        manager_email,
        manager_password
    } = req.body

    if (!manager_name || !manager_email || !manager_password) {
        res.status(400).json({
            msg: "Todos los campos son obligatorios"
        })
        return
    }

    if(manager_password.trim().length < 6){
        res.status(400).json({
            msg: "La contraseña debe tener al menos 6 caracteres"
        })
        return
    }

    if(!validator.isEmail(manager_email)){
        res.status(400).json({
            msg: "El email ingresado no es valido"
        })
        return
    }

    next()
}

const LoginManagerRouter:RequestHandler<{},{},LoginManager,{}> = async(
    req,
    res,
    next
): Promise<void> => {
    const {
        manager_email,
        manager_password
    } = req.body
    if (!manager_email || !manager_password) {
        res.status(400).json({
            msg: "Todos los campos son obligatorios"
        })
        return
    }

    if(!validator.isEmail(manager_email)){
        res.status(400).json({
            msg: "El email ingresado no es válido."
        })
        return
    }

    next()
}

const VerifyEmailRouter:RequestHandler<{},{},{},{manager_id:string}> = async(
    req,
    res,
    next
): Promise<void> => {
    const {
        manager_id
    } = req.query

    if(!manager_id){
        res.status(400).json({
            msg: "Enlace de verificación no valido."
        })
        return
    }

    next()
}

const SendPasswordResetEmailRouter:RequestHandler<{},{},{},{manager_email:string}> = async(
    req,
    res,
    next
): Promise<void> => {
    const {
        manager_email
    } = req.query

    if(!manager_email || !validator.isEmail(manager_email)){
        res.status(400).json({
            msg: "Email de restablecimiento de contraseña no valido."
        })
        return
    }

    next()
}


const ResetManagerPasswordRouter: RequestHandler<{},{},ResetManagerPassword,{}> = async(
    req,
    res,
    next
): Promise<void> => {
    const body = req.body;
    const requiredFields: (keyof ResetManagerPassword)[] = [
        "manager_id",
        "new_password",
        "confirm_password",
        "email",
        "url_id"
    ];

    const missingFields = requiredFields.filter(
        (key) => body[key] === undefined || body[key] === null || body[key] === ""
    )

    if (missingFields.length > 0) {
        res.status(400).json({
          msg: `Faltan los siguientes campos: ${missingFields.join(", ")}`
        });
        return;
      }

    if(body.new_password.trim().length < 6){
        res.status(400).json({
            msg: "La contraseña debe tener al menos 6 caracteres"
        })
        return
    }

    if(body.confirm_password.trim() !== body.new_password.trim()){
        res.status(400).json({
            msg: "Las contraseñas no coinciden."
        })
        return
    }
    
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            "SELECT * FROM recovery_manager WHERE recovery_id = $1 AND manager_id = $2",
            [body.url_id, body.manager_id]
        )

        if(result.rowCount === 0){
            res.status(400).json({
                msg: "Enlace de restablecimiento de contraseña no valido."
            })
            return
        }

        if(result.rows[0].used === true){
            res.status(400).json({
                msg: "El enlace ya fue utilizado."
            })
            return
        }

        const isExpired = dayjs().isAfter(dayjs(result.rows[0].expires_at));
        if(isExpired){
            res.status(400).json({
                msg: "El enlace ya expiro."
            })
            return
        }

        next()
    } catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
        res.status(500).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })        
        return;
    }finally{
        client && client.release()
    }
    next()
}

const ResetPasswordRouter: RequestHandler<{},{},{},{
    url_id:string,
    manager_id:string
}> = async(
    req,
    res,
    next
): Promise<void> => {
    const {
        url_id,
        manager_id
    } = req.query
    let client;

    if(!url_id || !manager_id){
        res.status(400).json({
            msg: "Enlace de restablecimiento de contraseña no valido."
        })
        return
    }

    try {
        client = await pool.connect();
        const result = await client.query(
            "SELECT * FROM recovery_manager WHERE recovery_id = $1 AND manager_id = $2",
            [url_id, manager_id]
        )

        if(result.rowCount === 0){
            res.status(400).json({
                msg: "Enlace de restablecimiento de contraseña no valido."
            })
            return
        }

        if(result.rows[0].used === true){
            res.status(400).json({
                msg: "El enlace ya fue utilizado."
            })
            return
        }

        const isExpired = dayjs().isAfter(dayjs(result.rows[0].expires_at));
        if(isExpired){
            res.status(400).json({
                msg: "El enlace ya expiro."
            })
            return
        }

        next()
    } catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
        res.status(500).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })        
        return;
    }finally{
        client && client.release()
    }
}


managerRoutes.post("/create-manager", CreateManagerRouter, CreateManagerController)

managerRoutes.post("/login-manager", LoginManagerRouter, LoginManagerController)

managerRoutes.get("/verify-email", VerifyEmailRouter, VerifyEmailController)

managerRoutes.delete("/delete-all-managers", deleteAllManagers)

managerRoutes.post("/send-password-reset-email", SendPasswordResetEmailRouter, sendPasswordResetEmail)

managerRoutes.post("/verify-password-reset-email", ResetManagerPasswordRouter, resetManagerPassword)

managerRoutes.get("/reset-password", ResetPasswordRouter, (req, res) => {
    return res.sendFile(path.join(__dirname, "../utils/Emails/RecoveryPassword/RecoverPasswordFront.html"))
})


export default managerRoutes
