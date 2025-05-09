import { RequestHandler, Router } from "express";
import { CreateManager, LoginManager } from "../Types/manager.types";
import validator from "validator";
import { CreateManagerController, LoginManagerController, VerifyEmailController } from "../controllers/ManagerController/manager.controller";

const usersRouter = Router()

const CreateManager:RequestHandler<{},{},CreateManager,{}> = async(
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

const LoginManager:RequestHandler<{},{},LoginManager,{}> = async(
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

const VerifyEmail:RequestHandler<{},{},{},{manager_id:string}> = async(
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


usersRouter.post("/create-manager", CreateManager, CreateManagerController)
usersRouter.post("/login-manager", LoginManager, LoginManagerController)
usersRouter.get("/verify-email", VerifyEmail, VerifyEmailController)

export default usersRouter
