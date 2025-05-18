import { Router, RequestHandler } from "express";
import redis from "../connections/redis_conn";
import { PredictionResult, SelectedFeatures } from "../Types/prediction.types";
import dayjs from "dayjs";
import { get } from "http";
import { pipeline } from "stream";

const predictRoutes = Router();

const StartPredictionRouter: RequestHandler<{}, {}, SelectedFeatures, {}> = async (
    req,
    res,
) => {
    const body = req.body;

    const requiredFields: (keyof SelectedFeatures)[] = [
        'PAYMENT_DAY',
        'APPLICATION_SUBMISSION_TYPE',
        'SEX',
        'MARITAL_STATUS',
        'QUANT_DEPENDANTS',
        'STATE_OF_BIRTH',
        'CITY_OF_BIRTH',
        'RESIDENCIAL_STATE',
        'RESIDENCIAL_CITY',
        'FLAG_RESIDENCIAL_PHONE',
        'RESIDENCE_TYPE',
        'MONTHS_IN_RESIDENCE',
        'FLAG_EMAIL',
        'TOTAL_MONTHLY_INCOME',
        'QUANT_BANKING_ACCOUNTS',
        'QUANT_SPECIAL_BANKING_ACCOUNTS',
        'PERSONAL_ASSETS_VALUE',
        'QUANT_CARS',
        'COMPANY',
        'PROFESSION_CODE',
        'OCCUPATION_TYPE',
        'FLAG_VISA',
        'FLAG_MASTERCARD',
        'FLAG_OTHER_CARDS',
        'PRODUCT',
        'AGE',
        'RESIDENCIAL_ZIP_3',
        'HAS_CREDIT_CARD'
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

    try {
        const key = crypto.randomUUID()
        const redisKey = `prediction:${key}`;
        const predictionData = {
            ...body,
            status: 'pending',
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        await redis.hset(redisKey, predictionData);

        await redis.expire(redisKey, 600); //Limite de 10 minutos
        res.status(200).json({
            msg: "Prediccion puesta en cola con exito.",
            prediction_id: key
        })

        return
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al encolar la prediccion."
        });
    }
};

const getPredictionStatus: RequestHandler<{}, {}, {}, { prediction_id: string }> = async (
    req,
    res
) => {
    const {
        prediction_id
    } = req.query

    if (!prediction_id) {
        res.status(400).json({
            msg: "El ID de la prediccion es requerido."
        })
        return
    }

    try {
        const predictionData = await redis.hgetall(`prediction:${prediction_id}`)
        const predictionStatus: string = predictionData.status

        const customMessage: { [key: string]: string } = {
            "pending": "En cola",
            "completed": "Completada",
            "failed": "Fallida"
        };
        res.status(200).json({
            msg: "El estado de la predicción es: " + customMessage[predictionStatus] + ".",
            status: predictionStatus,
            prediction_data: predictionStatus === "completed" ? predictionData : []
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el estado de la prediccion."
        });
    }
}

interface PredictionRedisData {
    status: string; 
    created_at: string; 
    [key: string]: string | null | undefined; 
}

interface PendingPredictionsMap {
    [redisKey: string]: PredictionRedisData;
}


const getPendingPredictions: RequestHandler<{}, {}, {}, {}> = async (
    req,
    res
): Promise<void> => {
    const pendingPredictions: PendingPredictionsMap = {};
    let cursor = '0';

    try {
        do {
            const scanResult = await redis.scan(cursor, 'MATCH', 'prediction:*', 'COUNT', 100);

            cursor = scanResult[0]; 
            const keys = scanResult[1]; 

            if (keys.length > 0) {
                const pipeline = redis.pipeline();
                keys.forEach(key => {
                    pipeline.hgetall(key);
                });
                const results = await pipeline.exec();

                results!.forEach((result, index) => {
                    const error = result[0]; 
                    const predictionData = result[1] as PredictionRedisData | null;

                    if (!error && predictionData && predictionData.status === 'pending') {
                        const fullKey = keys[index];

                        pendingPredictions[fullKey.split(":")[1]] = predictionData;
                    }
                });
            }

        } while (cursor !== '0'); 
        res.status(200).json(pendingPredictions);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error interno del servidor al obtener predicciones pendientes."
        });
    }
};

const SavePrediction: RequestHandler<{}, {}, PredictionResult, {prediction_result?: "completed" | "failed"}> = async (
    req,
    res
): Promise<void> => {
    const body = req.body
    const requiredFields: (keyof PredictionResult)[] = [
        "prediction_id",
        "client_score",
        "client_credit_status",
        "prediction_result" 
    ]
    const missingFields = requiredFields.filter(
        (key) => body[key] === undefined || body[key] === null || body[key] === ""
    );

    if (missingFields.length > 0) {
        res.status(400).json({
            msg: `Faltan los siguientes campos: ${missingFields.join(", ")}`
        });
        return;
    }
    const {
        prediction_id,
        client_score,
        client_credit_status,
        prediction_result
    } = body
    try {
        console.log(body)
        const redisKey = `prediction:${prediction_id}`;
        const predictionData = await redis.hgetall(redisKey)
        const created_at = predictionData.created_at
        const prediction_status = prediction_result === "completed" ? "completed" : "failed";
        const redisPipeline = redis.pipeline();
        
        const newDataToSave = {
            "client_score": client_score ? client_score : 0,
            "client_credit_status": client_credit_status ? client_credit_status : "none",
            "prediction_result": prediction_result,
            "status": prediction_status,
            "created_at": created_at
        }

        redisPipeline.del(redisKey)
        redisPipeline.hset(redisKey, newDataToSave)
        redisPipeline.expire(redisKey, 3600)
        await redisPipeline.exec()

        res.status(200).json({
            msg: "Prediccion guardada con exito."
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar y guardar los resultados de la predicción."
        });
    }   
}

predictRoutes.post("/start-prediction", StartPredictionRouter);
predictRoutes.get("/prediction-status", getPredictionStatus)
predictRoutes.get("/get-pending-predictions", getPendingPredictions)
predictRoutes.post("/save-prediction", SavePrediction)

export default predictRoutes