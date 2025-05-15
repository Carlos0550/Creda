import pool from "../../connections/database_conn";
import { RequestHandler } from "express";
import { getQueries } from "../../utils/QueriesHandler";
import path from "path";
import { CreateClient } from "../../Types/clients.types";
import { decrypt, encryptData } from "../../Security/EncryptationModule";

const queriesFolder:string = path.join(__dirname, "./Queries")

const queries = getQueries(queriesFolder)

if(!queries){
    console.log("Error en client.controller.ts: No se encontraron las Queries")
}

export const CreateClientController:RequestHandler<{},{msg: string},CreateClient,{}> = async(
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
        client_id,
        client_credit_status,
        client_score
    } = req.body

    try {
        client = await pool.connect();
        const encryptedID = encryptData(client_id.toString());
        const result1 = await pool.query(CCQueries[0],[encryptedID])

        if(result1.rows[0].count > 0){
            throw new Error("El ID del cliente ingresado ya existe.")
        }

        const result2 = await pool.query(CCQueries[1],[
            encryptedID,
            client_score,
            client_credit_status
        ])
        if(result2.rowCount! > 0){
            res.status(200).json({
                msg: "El cliente fue creado con exito.",
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

export const getClientDataController:RequestHandler<{},{},{},{client_id:string}> = async(
    req,
    res,
): Promise<void> => {
    const { client_id } = req.query
    let client
    const { "getClientData.sql": GCDQueries } = getQueries(queriesFolder) || { "getClientData.sql": "" }
    if(!GCDQueries){
        res.status(400).json({
            msg: "Error interno del servidor, espere unos segundos e intente nuevamente."
        })
        console.log("Error en client.controller.ts: No se encontraron las Queries")
        return
    }

    try {
        client = await pool.connect();
        const encryptedID = encryptData(client_id.toString());
        console.log(encryptedID)
        const result = await client.query(GCDQueries[0],[
            encryptedID
        ])

        if(result.rowCount! > 0){
            res.status(200).json({
                msg: "Cliente encontrado con éxito.",
                client_id: decrypt(result.rows[0].client_id),
                client_credit_status: result.rows[0].client_credit_status,
                client_score: result.rows[0].client_credit_scoring
            })
            return;
        }else{
            res.status(400).json({
                msg: "El cliente no pudo ser encontrado."
            })
            return
        }
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

export const GetAllClientsController:RequestHandler<{},{},{},{}> = async(
  req,
  res
): Promise<void> => {
    let client;

    try {
        client = await pool.connect();
        const result = await client.query("SELECT * FROM clients TABLESAMPLE SYSTEM (0.1) LIMIT 30;")
        if(result.rowCount! > 0){
            res.status(200).json({
                msg: "Clientes obtenidos con éxito.",
                rowsCount: result.rowCount,
                clients: result.rows
            })
            return
        }

        res.status(400).json({
            msg: "Un error ocurrio al obtener los clientes."
        })
        return
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
