import { NextFunction, Request, Router, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { PredicRequestEndpointInterface } from "../Types/predict.types";
import { analyzeFile } from "../controllers/PredictionsController/predict.controller";
import { createUserFunctionInterface } from "../Types/users.types";

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
    
    const uniqueFileName = `${uuidv4().slice(0,12)}${path.extname(file.originalname)}`;
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

predictRouter.post(
  "/analyze-file",
  upload.single("file"), 
  verifyRequest,            
  (req: Request, res: Response) => {
    res.status(200).json({
      msg: "Archivo recibido y datos del usuario verificados.",
      archivo: req.file?.filename,
    });
  }, analyzeFile
);

export default predictRouter;
