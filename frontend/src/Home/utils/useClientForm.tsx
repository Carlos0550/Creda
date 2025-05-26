import React, { useState, useEffect } from "react";
import { prediction_endpoints } from "../../Context/APIs";

// Definición del tipo de datos para el formulario
interface ClientFormData {
  ID_CLIENT: string;
  CLERK_TYPE: string;
  PAYMENT_DAY: number | null;
  APPLICATION_SUBMISSION_TYPE: string;
  QUANT_ADDITIONAL_CARDS: number | null;
  POSTAL_ADDRESS_TYPE: number | null;
  SEX: string;
  MARITAL_STATUS: number | null;
  QUANT_DEPENDANTS: number | null;
  EDUCATION_LEVEL: number | null;
  STATE_OF_BIRTH: string;
  CITY_OF_BIRTH: string;
  NACIONALITY: number | null;
  RESIDENCIAL_STATE: string;
  RESIDENCIAL_CITY: string;
  RESIDENCIAL_BOROUGH: string;
  FLAG_RESIDENCIAL_PHONE: string;
  RESIDENCIAL_PHONE_AREA_CODE: number | null;
  RESIDENCE_TYPE: number | null;
  MONTHS_IN_RESIDENCE: number | null;
  FLAG_MOBILE_PHONE: string;
  FLAG_EMAIL: number | null;
  PERSONAL_MONTHLY_INCOME: number | null;
  OTHER_INCOMES: number | null;
  FLAG_VISA: number | null;
  FLAG_MASTERCARD: number | null;
  FLAG_DINERS: number | null;
  FLAG_AMERICAN_EXPRESS: number | null;
  FLAG_OTHER_CARDS: number | null;
  QUANT_BANKING_ACCOUNTS: number | null;
  QUANT_SPECIAL_BANKING_ACCOUNTS: number | null;
  PERSONAL_ASSETS_VALUE: number | null;
  QUANT_CARS: number | null;
  COMPANY: string;
  PROFESSIONAL_STATE: string;
  PROFESSIONAL_CITY: string;
  PROFESSIONAL_BOROUGH: string;
  FLAG_PROFESSIONAL_PHONE: string;
  PROFESSIONAL_PHONE_AREA_CODE: number | null;
  MONTHS_IN_THE_JOB: number | null;
  PROFESSION_CODE: number | null;
  OCCUPATION_TYPE: number | null;
  MATE_PROFESSION_CODE: number | null;
  MATE_EDUCATION_LEVEL: number | null;
  FLAG_HOME_ADDRESS_DOCUMENT: number | null;
  FLAG_RG: number | null;
  FLAG_CPF: number | null;
  FLAG_INCOME_PROOF: number | null;
  PRODUCT: number | null;
  FLAG_ACSP_RECORD: string;
  AGE: number | null;
  RESIDENCIAL_ZIP_3: number | null;
  PROFESSIONAL_ZIP_3: number | null;
  HAS_CREDIT_CARD: number | null;
}

const initialFormData: ClientFormData = {
  ID_CLIENT: "",
  CLERK_TYPE: "C",
  PAYMENT_DAY: 10,
  APPLICATION_SUBMISSION_TYPE: "Web",
  QUANT_ADDITIONAL_CARDS: null,
  POSTAL_ADDRESS_TYPE: 1,
  SEX: "F",
  MARITAL_STATUS: 1,
  QUANT_DEPENDANTS: 0,
  EDUCATION_LEVEL: 5,
  STATE_OF_BIRTH: "SP",
  CITY_OF_BIRTH: "brasileira",
  NACIONALITY: 1,
  RESIDENCIAL_STATE: "SP.1",
  RESIDENCIAL_CITY: "sao paulo",
  RESIDENCIAL_BOROUGH: "mooca",
  FLAG_RESIDENCIAL_PHONE: "Y",
  RESIDENCIAL_PHONE_AREA_CODE: 5.1,
  RESIDENCE_TYPE: 1,
  MONTHS_IN_RESIDENCE: 29.0,
  FLAG_MOBILE_PHONE: "N",
  FLAG_EMAIL: 1,
  PERSONAL_MONTHLY_INCOME: 1118.93,
  OTHER_INCOMES: 0.2,
  FLAG_VISA: 1,
  FLAG_MASTERCARD: 1,
  FLAG_DINERS: 0,
  FLAG_AMERICAN_EXPRESS: 0,
  FLAG_OTHER_CARDS: 0,
  QUANT_BANKING_ACCOUNTS: 1.5,
  QUANT_SPECIAL_BANKING_ACCOUNTS: 1.6,
  PERSONAL_ASSETS_VALUE: 0.7,
  QUANT_CARS: 1.7,
  COMPANY: "Y.1",
  PROFESSIONAL_STATE: "SP.2",
  PROFESSIONAL_CITY: "sao paulo.1",
  PROFESSIONAL_BOROUGH: "mooca.1",
  FLAG_PROFESSIONAL_PHONE: "Y.2",
  PROFESSIONAL_PHONE_AREA_CODE: 5.2,
  MONTHS_IN_THE_JOB: 0.8,
  PROFESSION_CODE: 9,
  OCCUPATION_TYPE: 2.0,
  MATE_PROFESSION_CODE: null,
  MATE_EDUCATION_LEVEL: null,
  FLAG_HOME_ADDRESS_DOCUMENT: 0.9,
  FLAG_RG: 0,
  FLAG_CPF: 0,
  FLAG_INCOME_PROOF: 0.12,
  PRODUCT: 2,
  FLAG_ACSP_RECORD: "N.1",
  AGE: 29,
  RESIDENCIAL_ZIP_3: 318,
  PROFESSIONAL_ZIP_3: 318.1,
  HAS_CREDIT_CARD: 1.0,
};

export interface FormState {
  formData: ClientFormData;
  errors: { [key: string]: string };
  isSubmitting: boolean;
  submitSuccess: boolean | null;
  error: string | null;
  prediction: any | null;
  predictionId: string | null; // Nuevo: ID de la predicción en curso
  predictionStatus: "pending" | "completed" | "failed" | null; // Nuevo: estado de la predicción
}

export const useClientForm = () => {
  const [state, setState] = useState<FormState>({
    formData: initialFormData,
    errors: {},
    isSubmitting: false,
    submitSuccess: null,
    error: null,
    prediction: null,
    predictionId: null, // Inicialmente no hay predicción
    predictionStatus: null, // Inicialmente no hay estado de predicción
  });

  // Función para verificar el estado de la predicción
  const checkPredictionStatus = async (predictionId: string) => {
    try {
      const response = await fetch(
        prediction_endpoints.getPredictionStatus(predictionId).toString()
      );

      if (!response.ok) {
        throw new Error(`Error en la consulta: ${response.status}`);
      }

      const apiResponse = await response.json();

      // Return the API response directly so we can process it in the useEffect
      return apiResponse;
    } catch (error) {
      throw error;
    }
  };

  // UseEffect para verificar periódicamente el estado de la predicción
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.predictionId && state.predictionStatus === "pending") {
      // Iniciar verificación periódica
      intervalId = setInterval(async () => {
        try {
          const statusData = await checkPredictionStatus(state.predictionId!);

          // Actualizar estado según la respuesta
          if (statusData.status === "completed") {
            // La predicción ha terminado con éxito
            clearInterval(intervalId);

            // Transform the API response to match the expected format
            const predictionResult = {
              status: "success",
              predictions: [
                {
                  // Use client ID from the form
                  client_id: state.formData.ID_CLIENT,
                  // Parse the score as a number
                  client_credit_scoring: parseFloat(
                    statusData.prediction_data.client_score
                  ),
                  client_credit_status:
                    statusData.prediction_data.client_credit_status,
                },
              ],
              count: 1,
            };

            setState((prev) => ({
              ...prev,
              predictionStatus: "completed",
              isSubmitting: false,
              submitSuccess: true,
              prediction: predictionResult,
            }));
          } else if (statusData.status === "failed") {
            // La predicción ha fallado
            clearInterval(intervalId);
            setState((prev) => ({
              ...prev,
              predictionStatus: "failed",
              isSubmitting: false,
              submitSuccess: false,
              error: "La predicción ha fallado",
            }));
          }
          // Si sigue en "pending", continuamos esperando
        } catch (error) {
          clearInterval(intervalId);
          console.error("Error en la verificación periódica:", error);
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error:
              error instanceof Error ? error.message : "Error de verificación",
            predictionStatus: "failed",
          }));
        }
      }, 3000); // Verificar cada 3 segundos
    }

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.predictionId, state.predictionStatus]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    let parsedValue: string | number | null = value;

    // Parse numeric values
    if (type === "number") {
      parsedValue = value === "" ? null : Number(value);
    }

    // Handle checkboxes
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      parsedValue = checked ? "Y" : "N";
    }

    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: parsedValue,
      },
      errors: {
        ...prev.errors,
        [name]: "", // Eliminar error al editar
      },
    }));
  };

  // Modificar handleSubmit para usar el flujo asíncrono
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar Client ID
    const errors: { [key: string]: string } = {};

    if (!state.formData.ID_CLIENT || state.formData.ID_CLIENT.trim() === "") {
      errors.ID_CLIENT = "Client ID is required";
    }

    // Si hay errores, actualizamos el estado y no enviamos el formulario
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({
        ...prev,
        errors,
      }));
      return; // Detener envío
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
      predictionStatus: "pending", // Iniciar como pendiente
    }));

    try {
      // Modificar para incluir TOTAL_MONTHLY_INCOME
      const formDataWithTotal = {
        ...state.formData,
        TOTAL_MONTHLY_INCOME:
          (state.formData.PERSONAL_MONTHLY_INCOME || 0) +
          (state.formData.OTHER_INCOMES || 0),
      };

      // Usar el nuevo endpoint de inicio de predicción
      const response = await fetch(
        prediction_endpoints.startPrediction.toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataWithTotal),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.prediction_id) {
        throw new Error("No se recibió un ID de predicción válido");
      }

      // Guardar el ID de predicción
      setState((prev) => ({
        ...prev,
        predictionId: result.prediction_id,
        // No cambiamos isSubmitting a false todavía
      }));
    } catch (error) {
      console.error("Error:", error);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        predictionStatus: null,
      }));
    }
  };

  const resetForm = () => {
    setState({
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      submitSuccess: null,
      error: null,
      prediction: null,
    });
  };

  return {
    ...state,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};

export default useClientForm;
