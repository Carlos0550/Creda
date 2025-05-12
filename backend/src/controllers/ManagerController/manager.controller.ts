import pool from "../../connections/database_conn";
import { RequestHandler } from "express";
import { CreateManager, LoginManager, ResetManagerPassword } from "../../Types/manager.types";
import { comparePassword, getHashPassword } from "../../Security/PasswordSecurity";
import { getQueries } from "../../utils/QueriesHandler";
import path from "path";
import { sendEmail } from "../../utils/Emails/EmailVerification/SendEmailVerification";
import { getDomain } from "../../utils/DomainHandler";
import { sendRecoveryEmail } from "../../utils/Emails/RecoveryPassword/RecoverPassword";

const queriesFolder: string = path.join(__dirname, "./Queries")
export const CreateManagerController: RequestHandler<{}, {}, CreateManager, {}> = async (
    req,
    res
): Promise<void> => {
    const {
        manager_name,
        manager_email,
        manager_password
    } = req.body

    const hashedPsw = await getHashPassword(manager_password)
    const { "createManager.sql": CMQueries } = getQueries(queriesFolder)
    if (!CMQueries) {
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
        console.log("Error en manager.controller.ts: No se encontraron las Queries")
        return
    }

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN")
        const result1 = await client.query(CMQueries[0], [
            manager_email
        ])

        if (result1.rows[0].count > 0) {
            throw new Error("El email ingresado ya se encuentra registrado.")
        }

        const result2 = await client.query(CMQueries[1], [
            manager_name,
            manager_email,
            hashedPsw
        ])

        if (result2.rowCount! > 0) {
            await sendEmail({
                to: manager_email,
                subject: "Bienvenido a Creda!",
                user_name: manager_name,
                user_id: result2.rows[0].manager_id
            })
            res.status(200).json({
                msg: "Administrador creado con exito, se le envió un correo de validación."
            })
            await client.query("COMMIT")
            return
        }

        throw new Error("Ocurrió un error inesperado al crear el administrador, intente nuevamente.")
    } catch (error) {
        console.log(error)
        client && await client.query("ROLLBACK")
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
    } finally {
        client && client.release()
    }

}

export const LoginManagerController: RequestHandler<{}, {}, LoginManager, {}> = async (
    req,
    res
): Promise<void> => {
    const {
        manager_email,
        manager_password
    } = req.body
    const { "loginManager.sql": LMQueries } = getQueries(queriesFolder)
    if (!LMQueries) {
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
        console.log("Error en manager.controller.ts: No se encontraron las Queries")
        return
    }

    let client;

    try {
        client = await pool.connect();
        const result1 = await client.query(LMQueries[0], [
            manager_email
        ])
        if (result1.rows[0].count === "0") {
            res.status(404).json({
                msg: "El email ingresado no existe, verifique que el email sea el correcto."
            })

            return;
        }

        const result2 = await client.query(LMQueries[1], [
            manager_email,
        ])

        const manager = result2.rows[0]

        if (manager.manager_verified === false) {
            res.status(404).json({
                msg: "Su cuenta no ha sido verificada, revise la casilla de spam si no lo ha recibido."
            })
            await sendEmail({
                to: manager_email,
                subject: "Bienvenido a Creda!",
                user_name: manager.manager_name,
                user_id: manager.manager_id
            })
            return
        }

        const isPswCorrect = await comparePassword(manager_password, manager.manager_password.trim())
        if (!isPswCorrect) {
            res.status(404).json({
                msg: "La contraseña ingresada es incorrecta, verifique que la contraseña sea la correcta."
            })
            return;
        }

        const { manager_password: _, ...rest } = manager

        res.status(200).json({
            msg: "Administrador logueado con exito!",
            manager: rest
        })

        return;
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
    } finally {
        client && client.release()
    }

}

export const VerifyEmailController: RequestHandler<{}, {}, {}, { manager_id: string }> = async (
    req,
    res
): Promise<void> => {
    const {
        manager_id
    } = req.query

    let client;
    try {
        client = await pool.connect();
        const result = await client.query("UPDATE managers SET manager_verified = true WHERE manager_id = $1", [
            manager_id
        ])
        if (result.rowCount! > 0) {
            res.status(200).json({
                msg: "El correo fue verificado con exito."
            })

            return;
        } else {
            res.status(400).json({
                msg: "El correo no pudo ser verificado."
            })

            return;
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        })

        return;
    }
}

export const deleteAllManagers: RequestHandler = async (
    req,
    res
): Promise<void> => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN")
        const result = await client.query("DELETE FROM managers")
        if (result.rowCount! > 0) {
            await client.query("COMMIT")
            res.status(200).json({
                msg: "Todos los administradores fueron eliminados con exito."
            })
        } else {
            throw new Error("No se pudieron eliminar los administradores.")
        }
    } catch (error) {
        console.log(error)
        client && await client.query("ROLLBACK")
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
    }
}

export const sendPasswordResetEmail: RequestHandler<{}, {}, {}, { manager_email: string }> = async (
    req,
    res
): Promise<void> => {
    const {
        manager_email
    } = req.query
    let client;

    try {
        client = await pool.connect();
        const result1 = await client.query("SELECT COUNT(*) FROM managers WHERE manager_email = $1", [
            manager_email
        ])
        if (result1.rows[0].count === "0") {
            res.status(404).json({
                msg: "El email ingresado no existe, verifique que el email sea el correcto."
            })

            return;
        }

        const result2 = await client.query("SELECT * FROM managers WHERE manager_email = $1", [
            manager_email
        ])

        const manager = result2.rows[0]

        if (manager.manager_verified === false) {
            res.status(404).json({
                msg: "Su cuenta no ha sido verificada, revise la casilla de spam si no lo ha recibido."
            })
            await sendEmail({
                to: manager_email,
                subject: "Bienvenido a Creda!",
                user_name: manager.manager_name,
                user_id: manager.manager_id
            })
            return
        }

        const url = new URL(`${getDomain()}/managers/reset-password`);
        url.searchParams.append("manager_id", manager.manager_id);

        const oneHour = 60 * 60 * 1000;
        const result3 = await pool.query(`INSERT INTO recovery_manager(
                            manager_id,
                            expires_at
                        ) VALUES(
                            $1,
                            $2
                        ) RETURNING recovery_id;`, [
            manager.manager_id,
            new Date(Date.now() + oneHour)
        ])

        await sendRecoveryEmail({
            to: manager_email,
            subject: "Restablecimiento de contraseña",
            user_name: manager.manager_name,
            user_id: manager.manager_id,
            url_id: result3.rows[0].recovery_id
        })
        res.status(200).json({
            msg: "El correo fue enviado con exito."
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
    }
}

export const resetManagerPassword: RequestHandler<{}, {}, ResetManagerPassword, {}> = async (
    req,
    res
): Promise<void> => {
    const {
        manager_id,
        email,
        new_password,
        url_id
    } = req.body
    let client;
    const { "resetManagerPassword.sql": RMPQueries } = getQueries(queriesFolder); if (!RMPQueries) { res.status(400).json({ msg: "Error interno del servidor, espere unos segundos e intente nuevamente." }); console.log("Error en manager.controller.ts: No se encontraron las Queries"); return; }

    try {
        client = await pool.connect();
        await client.query("BEGIN")
        const result1 = await client.query(RMPQueries[0], [
            manager_id
        ]);

        if (result1.rowCount === 0) {
            res.status(404).json({
                msg: "Al parecer, no existe una cuenta con el email ingresado."
            })

            return;
        }

        const manager_data = result1.rows[0]
        if (email !== manager_data.manager_email) {
            res.status(404).json({
                msg: "Una de las credenciales ingresadas no son correctas."
            })

            return;
        }
        const newHashedPsw = await getHashPassword(new_password)
        const result2 = await client.query(RMPQueries[1], [
            newHashedPsw,
            manager_id
        ])

        if (result2.rowCount! > 0) {
            await client.query("COMMIT")
            await client.query(RMPQueries[2], [
                url_id
            ])
            res.status(200).json({
                msg: "La contraseña fue restablecida con exito."
            })
        } else {
            await client.query("ROLLBACK")
            res.status(400).json({
                msg: "La contraseña no pudo ser restablecida."
            })
        }
    } catch (error) {
        console.log(error)
        client && await client.query("ROLLBACK")
        res.status(400).json({
            msg: error instanceof Error ? error.message : "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
    }
}