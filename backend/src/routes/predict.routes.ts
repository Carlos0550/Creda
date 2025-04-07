import { NextFunction, Request, Router, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { getAndLockPendingFile, markFilesAsAnalyzed, saveFile, verifyFileState } from "../controllers/PredictionsController/predict.controller";
import { createUserFunctionInterface } from "../Types/users.types";
import { MarkAsAnalyzedEndpointInterface } from "../Types/predict.types";

const predictRouter = Router();
const uploadFolder = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {

    const uniqueFileName = `${uuidv4().slice(0, 12)}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage });

const verifyRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_data } = req.body;
  const user_info: Partial<createUserFunctionInterface> = JSON.parse(user_data)
  if (!user_info?.user_name) {
    res.status(400).json({
      msg: "El servidor no recibió los datos del usuario. No fue posible hacer una predicción.",
    });
    return
  }

  next();
};

const handleRollbackFile = (fileName: string) => {
  const uploadFolder = path.join(__dirname, "../uploads")
  const filePath = path.join(uploadFolder, fileName)
  
  setTimeout(() => {
    if(fs.existsSync(filePath)){
      try {
        fs.unlinkSync(filePath)
        console.log("Archivo eliminado:", fileName);
      } catch (error) {
        console.error("No se pudo eliminar el archivo:", error);
      }
    }
  }, 500);
}

predictRouter.post("/analyze-file", upload.single("file"), verifyRequest, (req: Request, res: Response, next: NextFunction) => {
  const fileName = req.file?.filename;
  const { user_data } = req.body;
  const parsedData = user_data ? JSON.parse(user_data) : ""
  if (!fileName || !parsedData) {
    res.status(400).json({
      msg: "Faltan datos: se requiere un archivo válido y el userId."
    });

    if(fileName) handleRollbackFile(fileName)
    return
  }

  next()
}, saveFile);

predictRouter.get("/file-status", async (req: Request, res: Response, next: NextFunction) => {
  const { status, user_id } = req.query
  if (!status) {
    res.status(400).json({
      msg: "El parametro 'status' no se encontró en la solicitud."
    })
    return
  }

  if (!user_id) {
    res.status(400).json({
      msg: "No se encontro el ID del usuario en la solicitud."
    })
    return
  }
  const validStatuses = ["pending", "locked", "analyzed"] as const;
  type FileStatus = typeof validStatuses[number]
  if (!status || typeof status !== "string") {
    res.status(400).json({ msg: "Falta o es inválido el parámetro 'status'" });
    return
  }

  if (!validStatuses.includes(status as FileStatus)) {
    res.status(400).json({
      msg: `Estado inválido. Usa uno de: ${validStatuses.join(", ")}`
    });
    return
  }

  next()
}, verifyFileState)

predictRouter.post("/get-pending", getAndLockPendingFile)

predictRouter.post("/mark-as-analyzed", async (req: Request<{}, {}, MarkAsAnalyzedEndpointInterface>, res: Response, next: NextFunction) => {
  const { fileName, columns } = req.body
  if (!fileName) {
    res.status(400).json({
      msg: "El nombre del archivo es requerido."
    })
    return
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    res.status(400).json({
      msg: "El argumento 'columns' es inválido o está vacío"
    });
    return;
  }


  next()
}, markFilesAsAnalyzed)

export default predictRouter;
