import { RequestHandler, Router } from "express";
import { CreateClient } from "../Types/clients.types";
import { CreateClientController, getClientDataController } from "../controllers/ClientsController/client.controller";
import { insertBulkClients } from "../test/PopulateClients/Populate_clients";
import { deleteAllClients } from "../test/DeleteAllClients/Delete_all_clients";

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

//Tests
router.post("/test/insert-random-clients", async (req, res) => {
  const { count } = req.body;
  console.warn("INICIANDO TEST: Insertar clientes random.");
  const result = await insertBulkClients(Number(count));
  console.warn("TERMINADO TEST: Insertar clientes random.");

  if (result) {
      res.status(200).json({ msg: "Clientes insertados con éxito." });
  } else {
      res.status(500).json({ msg: "Error al insertar los clientes." });
  }
});

router.delete("/test/delete-all-clients", async (req, res) => {
  console.warn("INICIANDO TEST: Eliminar todos los clientes.");
  const result = await deleteAllClients();
  console.warn("TERMINADO TEST: Eliminar todos los clientes.");

  if (result) {
      res.status(200).json({ msg: "Todos los clientes fueron eliminados con éxito." });
  } else {
      res.status(500).json({ msg: "Error al eliminar los clientes." });
  }
});

export default router