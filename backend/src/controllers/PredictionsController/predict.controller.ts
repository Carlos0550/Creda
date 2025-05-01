import { Request, Response } from "express";
import redis from "../../connections/redis_conn";
import { randomUUID } from "crypto";

//guarda un archivo en redis (lo agrega a la cola con estado pendiente de analisis)
export async function saveFile(req: Request, res: Response) {
    const fileName = req.file?.filename;
    const { user_id } = req.body;
    try {
        console.log("Agregando nuevo archivo a Redis pendiente de análisis...");

        try {
            console.log("Comprobando existencia de archivos pendientes de analisis...")
            const filesCount = await redis.smembers(`user_files:${user_id}`) // esto es para verificar que el mismo usuario no suba otro archivo hasta completar la prediccion
            if(filesCount.length > 0){
                res.status(400).json({
                    msg: "Ya hay un archivo pendiente de analisis, espere unos segundos o recargue esta sección"
                })

                return
            }
        } catch (error) {
            console.log(error)
        }

        await redis.sadd("files:pending", fileName || randomUUID());

        const metadataKey = `filedata:${fileName}`;
        await redis.hset(metadataKey, {
            user_id,
            status: "pending"
        });
        await redis.sadd(`user_files:${user_id}`, `filedata:${fileName}`)
        console.log("Archivo pendiente de análisis agregado...");

        res.status(200).json({
            msg: "Archivo encolado, espere unos segundos..."
        });
        return

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error interno del servidor, no fue posible comenzar el análisis."
        });
        return
    }
}   

//devuelve el estado de un/los archivo/s en la cola, 
export async function verifyFileState(req: Request, res: Response) {
    const { status, userId } = req.query;

    if (!status || typeof status !== "string") {
        res.status(400).json({
            msg: "Falta el parámetro obligatorio 'status'."
        });
        return
    }

    try {
        const redisKey = `files:${status}`;
        const files = await redis.smembers(redisKey);
        if (!files.length) {
            res.status(404).json({
                msg: `No se encontraron archivos con el estado '${status}'`
            });
            return
        }

        // Si no se envió userId, devolvemos todo
        if (!userId) {
            res.status(200).json({
                status,
                archivos: files.map((file: any) => ({ file }))
            });
            return
        }

        const userKeys = await redis.smembers(`user_files:${userId}`);
        const userFiles: { file: string, data?: string[] }[] = [];
        
        for (const key of userKeys) {
            const data = await redis.hgetall(key);
            
            if (data.status === status) {
                const fileName = key.replace("filedata:", "");
                userFiles.push({
                    file: fileName,
                    data: data.data ? JSON.parse(data.data) : undefined  
                });
            }
        }
    
        res.status(200).json({
            status,
            archivos: userFiles
        });
        return;

    } catch (error) {
        console.error("Error verificando estado de archivos:", error);
        res.status(500).json({
            msg: "Error interno del servidor al verificar el estado de los archivos"
        });
        return
    }
}

//obtienew archivos pendientes de analisis y los bloquea 
export async function getAndLockPendingFile(req: Request, res: Response) {
    try {
        const file = await redis.spop("files:pending");

        if (!file) {
             res.status(404).json({
                msg: "No hay archivos pendientes."
            });
            return
        }

        await redis.sadd("files:locked", file);

        const metadataKey = `filedata:${file}`;
        await redis.hset(metadataKey, "status", "locked");

        res.status(200).json({ file });
        return
    } catch (error) {
        console.error("Error al obtener archivo pendiente:", error);
         res.status(500).json({ msg: "Error interno del servidor" });
         return
    }
}

//Recibe las columnas del servicio de colas, y
// marca archivos bloqueados como ya analizados junto con sus columnas
export async function markFilesAsAnalyzed(req: Request, res: Response) {
    const { fileName, records } = req.body;
    if (!fileName || !records) {
         res.status(400).json({
            msg: "Faltan datos: se requiere 'fileName' y un array 'columns'."
        });
        return
    }

    try {
        await redis.srem("files:locked", fileName);
        await redis.sadd("files:analyzed", fileName);

        const metadataKey = `filedata:${fileName}`;
        await redis.hset(metadataKey, {
            status: "analyzed",
            data: JSON.stringify(records)
        });

        res.sendStatus(204);
        return
    } catch (error) {
        console.error("Error al marcar archivo como analizado:", error);
        res.status(500).json({
            msg: "Error interno al marcar archivo como analizado."
        });

        return
    }
}
