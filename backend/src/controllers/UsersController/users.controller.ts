import { Request, Response } from "express";
import pool from "../../connections/database_conn";
import { createUserFunctionInterface, loginUserFunctionInterface } from "../../Types/users.types";
import fs from "fs"
import path from "path"
import { comparePassword, genHashPassword } from "../../Security/PasswordSecurity";

let queries: Record<string, string[]> = {};

(async () => {
    try {
        const files = await fs.promises.readdir(path.join(__dirname, "./Queries"));
        const sqlFiles = files.filter(file => file.endsWith(".sql"));

        await Promise.all(sqlFiles.map(async (file) => {
            const filePath = path.join(__dirname, "./Queries", file);
            const content = await fs.promises.readFile(filePath, "utf-8");
            const queriesArray = content
                .split(";")
                .map(query => query.trim())
                .filter(query => query.length > 0);
            queries[file] = queriesArray;
        }));
        console.log("✅ Archivos SQL de usuarios cargados exitosamente");
    } catch (error) {
        console.error("❌ Error cargando archivos SQL de usuarios:", error);
        process.exit(1);
    }
})();

const capitalizeNames = (name: string) => {
    if(!name) return null
    const words = name.split(" ");
    return words.map(letters => 
        letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase()
    ).join(" ")
}

export async function createUser(
    req: Request<{}, {}, createUserFunctionInterface>,
    res: Response
  ) {
    let client;
  
    const { "createUser.sql": CUQueries } = queries;
    if (!CUQueries) {
      console.log("Archivo createUser.sql no encontrado");
        res.status(500).json({
        msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
      });
      return
    }
    const {
        user_email,
        user_name,
        user_password
    } = req.body
    try {
        client = await pool.connect()

        const clientsCount = await client.query(CUQueries[0], [user_email])
        if(clientsCount.rows[0].count > 0){
            res.status(400).json({
                msg: "El correo ingresado ya esta registrado."
            });
            return;
        }

        const hashedPassword = await genHashPassword(user_password)
        
        const result = await pool.query(CUQueries[1], [
            capitalizeNames(user_name),
            user_email,
            hashedPassword
        ])
        if(result.rowCount === 0) {
            res.status(400).json({
            msg: "Ocurrió un problema al intentar registrarte, espera unos segundos e intenta nuevamente"
        })
        return
    }

        res.status(201).json({
            msg: `Cuenta creada exitosamente, bienvenido a Creda ${user_name}`
        })
        return
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: "Error interno en el servidor, espera unos segundos e intenta nuevamente"
        })
        return
    }finally{
        if(client) client.release()
    }
  }

export async function loginUser(req:Request<{},{},loginUserFunctionInterface>, res:Response) {
    const { "loginUser.sql": LUQueries } = queries
    if(!LUQueries){
        res.status(500).json({
            msg: "Error interno en el servidor, espere unos segundos e intente nuevamente."
        })
        console.log("Archivo 'LOGINUSER.SQL' no encontrado.")
        return;
    };

    type ResponseUserTypes = {
        user_id: string,
        user_name: string,
        user_email: string,
        user_password: string
    }

    const { user_email, user_password } = req.body
    let client;
    try {
        client = await pool.connect()
        const result1 = await client.query(LUQueries[0],[user_email])
        const userCount = result1.rows[0].count

        if(parseInt(userCount) === 0){
            res.status(404).json({
                msg: "El correo ingresado no está registrado, por favor corrobore los datos ingresados."
            });
            return;
        }

        const result2 = await client.query(LUQueries[1], [user_email]);
        const user = result2.rows[0] as ResponseUserTypes;

        if(await comparePassword(user_password, user.user_password)){
            res.status(200).json({
                msg: `Bienvenido, ${capitalizeNames(user.user_name)}`,
                userData: user
            })
            return
        }else{
            res.status(400).json({
                msg: "Credenciales incorrectas, verifique la contraseña e intente nuevamente."
            })
            return
        }
    } catch (error) {
        res.status(500).json({
            msg: "Error interno en el servidor, espere unos segundos e intente nuevamente."
        })
        console.log("Error en loginUserFunction: ", error)
        return;
    }finally{
        if(client) client.release()
    }
}