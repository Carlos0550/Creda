import { RequestHandler, Router } from "express";
import { CreateClient } from "../Types/clients.types";
import { CreateClientController } from "../controllers/ClientsController/client.controller";

const router = Router()

const CreateClient: RequestHandler<{}, { msg: string, client_id?: string }, CreateClient, {}> = async (
    req,
    res,
    next
): Promise<void> => {
    const {
        client_name,
        client_nationality,
        client_id
    } = req.body

    if (!client_name || !client_nationality || !client_id) {
        res.status(400).json({
            msg: "Todos los campos son obligatorios"
        })
        return
    }
    next()
}

router.post("/create-client", CreateClient, CreateClientController)

export default router