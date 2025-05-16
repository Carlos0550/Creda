export interface SelectedFeatures {
  PAYMENT_DAY: any;
  APPLICATION_SUBMISSION_TYPE: any;
  SEX: any;
  MARITAL_STATUS: any;
  QUANT_DEPENDANTS: any;
  STATE_OF_BIRTH: any;
  CITY_OF_BIRTH: any;
  RESIDENCIAL_STATE: any;
  RESIDENCIAL_CITY: any;
  FLAG_RESIDENCIAL_PHONE: any;
  RESIDENCE_TYPE: any;
  MONTHS_IN_RESIDENCE: any;
  FLAG_EMAIL: any;
  TOTAL_MONTHLY_INCOME: any;
  QUANT_BANKING_ACCOUNTS: any;
  QUANT_SPECIAL_BANKING_ACCOUNTS: any;
  PERSONAL_ASSETS_VALUE: any;
  QUANT_CARS: any;
  COMPANY: any;
  PROFESSION_CODE: any;
  OCCUPATION_TYPE: any;
  FLAG_VISA: any;
  FLAG_MASTERCARD: any;
  FLAG_OTHER_CARDS: any;
  PRODUCT: any;
  AGE: any;
  RESIDENCIAL_ZIP_3: any;
  HAS_CREDIT_CARD: any;
}

export interface PredictionResult{
    client_score: number,
    client_credit_status: "good" | "bad",
    prediction_id: string,
    prediction_result?: "completed" | "failed"
};

