import { NextFunction, Router } from "express";
import { Request, Response } from "express";

const usersRouter = Router()

import * as users_controller from "../controllers/UsersController/users.controller"
import { createUserFunctionInterface, loginUserFunctionInterface } from "../Types/users.types";

usersRouter.post("/create-user",(
        req: Request<{}, {}, createUserFunctionInterface>,
        res: Response,
        next: NextFunction
    ) => {
        const { user_password, user_email, user_name } = req.body;

        if (user_name.trim().length < 3) {
            res.status(400).json({
                msg: "El nombre debe tener al menos 3 caracteres."
            })
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user_email)) {
            res.status(400).json({
                msg: "El correo electrónico ingresado no es válido."
            })
            return
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,24}$/;
        if (!passwordRegex.test(user_password)) {
            res.status(400).json({
                msg: "La contraseña debe tener entre 8 y 24 caracteres, incluyendo letras, números y al menos un carácter especial."
            })
            return
        }

        next();
    }, users_controller.createUser);

usersRouter.post("/login-user", (
    req: Request<{},{}, loginUserFunctionInterface>,
    res: Response,
    next: NextFunction   
) => {
    const { user_email, user_password } = req.body

    if(!user_email || !user_password){
        res.status(400).json({
            msg: "El servidor no recibió algunos parametros, verifique que todos los campos estén completos e intente nuevamente."
        });
        return
    }
    next()
}, users_controller.loginUser)

export default usersRouter
