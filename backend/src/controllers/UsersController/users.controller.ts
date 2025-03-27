import { Request, Response } from "express";
import pool from "../../connections/database_conn";
import { createUserFunctionInterface } from "../../Types/users.types";
import fs from "fs"
import path from "path"
import { genHashPassword } from "../../Security/PasswordSecurity";

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