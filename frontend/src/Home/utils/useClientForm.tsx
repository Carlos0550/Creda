import { useState } from "react";
import { url_predictform } from "../../Context/APIs";

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
  MARITAL_STATUS: 1.1,
  QUANT_DEPENDANTS: 0,
  EDUCATION_LEVEL: 5,
  STATE_OF_BIRTH: "SP",
  CITY_OF_BIRTH: "brasileira",
  NACIONALITY: 1.2,
  RESIDENCIAL_STATE: "SP.1",
  RESIDENCIAL_CITY: "sao paulo",
  RESIDENCIAL_BOROUGH: "mooca",
  FLAG_RESIDENCIAL_PHONE: "Y",
  RESIDENCIAL_PHONE_AREA_CODE: 5.1,
  RESIDENCE_TYPE: 1.3,
  MONTHS_IN_RESIDENCE: 29.0,
  FLAG_MOBILE_PHONE: "N",
  FLAG_EMAIL: 0.1,
  PERSONAL_MONTHLY_INCOME: 1118.93,
  OTHER_INCOMES: 0.2,
  FLAG_VISA: 1.4,
  FLAG_MASTERCARD: 0.3,
  FLAG_DINERS: 0.4,
  FLAG_AMERICAN_EXPRESS: 0.5,
  FLAG_OTHER_CARDS: 0.6,
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
  FLAG_RG: 0.1,
  FLAG_CPF: 0.11,
  FLAG_INCOME_PROOF: 0.12,
  PRODUCT: 2.1,
  FLAG_ACSP_RECORD: "N.1",
  AGE: 29.1,
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
}

export const useClientForm = () => {
  const [state, setState] = useState<FormState>({
    formData: initialFormData,
    errors: {},
    isSubmitting: false,
    submitSuccess: null,
    error: null,
    prediction: null,
  });

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

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await fetch(url_predictform.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: true,
        prediction: result,
      }));
    } catch (error) {
      console.error("Error submitting form:", error);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: false,
        error: error instanceof Error ? error.message : "Error desconocido",
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
