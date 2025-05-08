import pool from "../../connections/database_conn";
import { RequestHandler } from "express";
import { getQueries } from "../../utils/QueriesHandler";
import path from "path";
import { CreateClient } from "../../Types/clients.types";
import { encryptData } from "../../Security/EncryptationModule";

const queriesFolder:string = path.join(__dirname, "./Queries")

const queries = getQueries(queriesFolder)

if(!queries){
    console.log("Error en client.controller.ts: No se encontraron las Queries")
}

export const CreateClientController:RequestHandler<{},{msg: string, client_id?: string},CreateClient,{}> = async(
    req,res
): Promise<void> => {
    let client;
    const {"createClient.sql": CCQueries} = queries
    if(!CCQueries){
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
        console.log("Error en client.controller.ts: No se encontraron las Queries")
        return
    }

    const {
        client_name,
        client_nationality,
        client_id
    } = req.body

    try {
        client = await pool.connect();
        const encryptedID = encryptData(client_id.toString());
        const result1 = await pool.query(CCQueries[0],[encryptedID])

        if(result1.rows[0].count > 0){
            throw new Error("El ID del cliente ingresado ya existe.")
        }

        const result2 = await pool.query(CCQueries[1],[
            client_name,
            client_nationality,
            encryptedID
        ])
        if(result2.rowCount! > 0){
            res.status(200).json({
                msg: "El cliente fue creado con exito.",
                client_id: (result2.rows[0].encryptedID).toString()
            })
            return;
        }

        return;
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
        return
    }finally{
        client && client.release();
    }
}