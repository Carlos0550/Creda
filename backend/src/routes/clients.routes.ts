import { RequestHandler, Router } from "express";
import { CreateClient } from "../Types/clients.types";
import { CreateClientController, getClientDataController } from "../controllers/ClientsController/client.controller";

const router = Router()

const CreateClient: RequestHandler<
  {},
  { msg: string; client_id?: string },
  CreateClient,
  {}
> = async (req, res, next): Promise<void> => {
  const body = req.body;

  const requiredFields: (keyof CreateClient)[] = [
    "client_id",
    "client_credit_status",
    "client_score"
  ];

  const missingFields = requiredFields.filter(
    (key) => body[key] === undefined || body[key] === null || body[key] === ""
  );

  if (missingFields.length > 0) {
    res.status(400).json({
      msg: `Faltan los siguientes campos: ${missingFields.join(", ")}`
    });
    return;
  }

  const validCreditStatuses: CreateClient["client_credit_status"][] = ["good", "bad"];
  if (!validCreditStatuses.includes(body.client_credit_status)) {
    res.status(400).json({
      msg: `Valor inválido para 'client_credit_status'. Debe ser: ${validCreditStatuses.join(" o ")}`
    });
    return;
  }

  next();
};

const getClientData:RequestHandler<{},{},{},{client_id:string}> = async(
    req,
    res,
    next
): Promise<void> => {
    const { client_id } = req.query
    if(!client_id){
        res.status(400).json({
            msg: "El ID del cliente es requerido."
        })
        return
    }

    next()
}


router.post("/create-client", CreateClient, CreateClientController)
router.get("/get-client-data", getClientData, getClientDataController)

export default router