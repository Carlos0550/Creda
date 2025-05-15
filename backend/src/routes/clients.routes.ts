import { RequestHandler, Router } from "express";
import { CreateClient } from "../Types/clients.types";
import { CreateClientController, GetAllClientsController, getClientDataController } from "../controllers/ClientsController/client.controller";
import { insertBulkClients } from "../test/PopulateClients/Populate_clients";
import { deleteAllClients } from "../test/DeleteAllClients/Delete_all_clients";
import { RollbackFile, upload } from "../utils/FileStorageHandler";
import redis from "../connections/redis_conn";
import { FileMetadataWithKey, RedisFileMetadata } from "../Types/redis.types";
import dayjs from "dayjs";
import path from "path";

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

const getClientData: RequestHandler<{}, {}, {}, { client_id: string }> = async (
  req,
  res,
  next
): Promise<void> => {
  const { client_id } = req.query
  if (!client_id) {
    res.status(400).json({
      msg: "El ID del cliente es requerido."
    })
    return
  }

  next()
}

export const SaveCSVRouter: RequestHandler<{}, {}, {}, {}> = async (
  req,
  res,
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    return;
  }

  const file = req.file as Express.Multer.File;
  const redisKey = `client_file:${file.filename}`;

  try {
    const fileData = {
      file_name: file.filename,
      file_path: `/uploads/${file.filename}`,
      file_type: file.mimetype,
      file_size: file.size,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    await redis.hset(redisKey, fileData)
    res.status(200).json({
      msg: `Archivo guardado con éxito. "${file.originalname}"`
    })

    return;
  } catch (error) {
    console.error('Error al guardar el archivo en Redis:', error);
    if (req.file) {
      RollbackFile(req.file.filename)
    }
    res.status(500).json({ message: 'Error interno del servidor, espere unos segundos e intente nuevamente.' });
    return;
  }
}

export const GetFilesStatus: RequestHandler<{}, {}, {}, {}> = async (
  _,
  res,
): Promise<void> => {
  try {
    const keys = await redis.keys('client_file:*');

    if (!keys || keys.length === 0) {
      res.status(404).json({
        msg: "No se encontraron archivos."
      });
      return;
    }


    const pipeline = redis.pipeline();

    for (const key of keys) {
      pipeline.hgetall(key);
    }


    const results = await pipeline.exec();

    const fileMetadataList: FileMetadataWithKey[] = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const [error, metadata] = results![i];

      if (error) {
        console.error(`Error al recuperar metadatos para la clave ${key}:`, error);
        continue;
      }


      if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
        const metadataWithKey: FileMetadataWithKey = {
          ...(metadata as RedisFileMetadata),
          key: key
        };
        fileMetadataList.push(metadataWithKey);
      } else {

        console.warn(`La clave ${key} no devolvió metadatos de Hash válidos.`);
      }
    }

    res.status(200).json({
      msg: "Archivos encontrados con éxito.",
      files: fileMetadataList
    });

  } catch (error: any) {
    console.error('Error al recuperar claves o ejecutar pipeline de Redis:', error);
    res.status(500).json({
      message: 'Error interno del servidor al recuperar el estado de los archivos.',
      error: error.message
    });
  }
};


const DownloadFile: RequestHandler<{}, {}, {}, { file_id: string }> = async (
  req,
  res
): Promise<void> => {
  const {
    file_id
  } = req.query

  if (!file_id) {
    res.status(400).json({
      msg: "El ID del archivo es necesario."
    })
    return;
  }

  const redisKey = file_id;
  try {
    const fileMetadata = await redis.hgetall(redisKey) as unknown as RedisFileMetadata | null;
    console.log(fileMetadata)
    if (!fileMetadata || Object.keys(fileMetadata).length === 0) {
      res.status(404).json({
        msg: "Metadatos del archivo no encontrados en Redis."
      });
      return;
    }

    const storedFilePath = fileMetadata.file_path;
    if (!storedFilePath) {
      console.error(`Metadatos para la clave ${redisKey} no contienen una ruta de archivo.`);
      res.status(500).json({
        msg: "La ruta del archivo no está disponible en los metadatos."
      });
      return;
    }

    const downloadFileName = fileMetadata.file_name;

    if (!downloadFileName) {
      console.error(`Metadatos para la clave ${redisKey} no contienen un nombre de archivo.`);
      res.status(500).json({
        msg: "El nombre del archivo no está disponible en los metadatos."
      });
      return;
    }
    const uploadsFolder = path.join(__dirname, "../uploads")
    const downloadPath = path.join(uploadsFolder, downloadFileName);
    res.download(downloadPath, downloadFileName, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        res.status(500).json({
          msg: "Error al descargar el archivo."
        });
      }
    });
    return
  } catch (error) {
    console.error('Error al obtener metadatos del archivo de Redis:', error);
    res.status(500).json({
      msg: "Error al obtener metadatos del archivo de Redis."
    });
    return
  }
}

router.post("/create-client", CreateClient, CreateClientController)
router.get("/get-client-data", getClientData, getClientDataController)
router.get("/get-all-clients", GetAllClientsController)
router.post("/save-csv", upload.single("file"), SaveCSVRouter)
router.get("/get-files-status", GetFilesStatus),
router.get("/download-file", DownloadFile)

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