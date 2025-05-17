import { Router, RequestHandler } from "express";
import redis from "../connections/redis_conn";
import { PredictionResult, SelectedFeatures } from "../Types/prediction.types";
import dayjs from "dayjs";
import { get } from "http";

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
            status: predictionStatus
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el estado de la prediccion."
        });
    }
}

interface PendingPredictionInfo {
    prediction_id: string;
    createdAt: string | null;
}
const getPendingPredictions: RequestHandler<{}, {}, {}, {}> = async (
    req,
    res
): Promise<void> => {
    const pendingPredictions: PendingPredictionInfo[] = [];
    let cursor = '0';

    try {
        do {
            const scanResult = await redis.scan(cursor, 'MATCH', 'prediction:*', 'COUNT', 100);

            cursor = scanResult[0];
            const keys = scanResult[1];

            if (keys.length > 0) {
                const pipeline = redis.pipeline();
                keys.forEach(key => {
                    pipeline.hmget(key, 'status', 'created_at');
                });
                const results = await pipeline.exec();

                results!.forEach((result, index) => {
                    const error = result[0];
                    const values = result[1] as (string | null)[];

                    if (!error && values && values[0] === 'pending') {
                        const fullKey = keys[index];
                        const onlyKey = fullKey.split(":")[1];
                        const createdAtValue = values[1]; 

                        pendingPredictions.push({
                            prediction_id: onlyKey,
                            createdAt: createdAtValue
                        });
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
        "client_credit_status"
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
}

predictRoutes.get("/prediction-status", getPredictionStatus)
predictRoutes.get("/get-pending-predictions", getPendingPredictions)
predictRoutes.post("/start-prediction", StartPredictionRouter);

export default predictRoutes