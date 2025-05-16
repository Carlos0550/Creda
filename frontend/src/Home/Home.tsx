import React, { useState, useEffect } from "react";
import useClientForm from "./utils/useClientForm";

interface PredictionResponse {
  status: string;
  predictions: {
    client_id: string;
    client_credit_scoring: number;
    client_credit_status: string;
  }[];
  count: number;
}

interface PredictionAlertProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResponse | null;
  isLoading: boolean;
  error: string | null;
}

const PredictionAlert: React.FC<PredictionAlertProps> = ({
  isOpen,
  onClose,
  prediction,
  isLoading,
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get prediction data from the first result in the array
  const predictionData = prediction?.predictions?.[0];
  const isGoodCredit = predictionData?.client_credit_status === "good";
  const score = predictionData?.client_credit_scoring || 0;

  return (
    <>
      <style>
        {`
          .credit-alert {
            max-width: 500px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          }
          
          .credit-alert-header {
            padding: 16px 24px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }
          
          .credit-alert-body {
            padding: 20px 24px;
          }
          
          .credit-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          
          .credit-info-card {
            background: #f9fafb;
            border-radius: 8px;
            padding: 16px 20px;
            border: 1px solid rgba(0, 0, 0, 0.06);
          }
          
          .credit-info-label {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .credit-info-value {
            font-size: 1.125rem;
            font-weight: 600;
          }
          
          .credit-score-container {
            margin: 20px 0;
          }
          
          .credit-score-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .credit-score-bar {
            height: 8px;
            border-radius: 9999px;
            background: #f3f4f6;
            overflow: hidden;
            margin-bottom: 10px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
          }
          
          .credit-score-progress {
            height: 100%;
            border-radius: 9999px;
          }
          
          .credit-message {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            color: #1e40af;
            border-radius: 0 6px 6px 0;
            margin-top: 20px;
            font-size: 0.875rem;
          }
          
          .credit-alert-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            background: #f9fafb;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
          }
          
          .btn {
            padding: 8px 20px;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 6px;
            transition: all 0.15s ease;
            cursor: pointer;
          }
          
          .btn-dismiss {
            background: #e5e7eb;
            color: #374151;
          }
          
          .btn-dismiss:hover {
            background: #d1d5db;
          }
          
          .btn-primary {
            background: #2563eb;
            color: white;
          }
          
          .btn-primary:hover {
            background: #1d4ed8;
          }

          .success-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ecfdf5;
            color: #059669;
            border-radius: 50%;
          }

          .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 9999px;
            font-weight: 500;
            font-size: 0.875rem;
          }
          
          .status-badge-good {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          .status-badge-bad {
            background-color: #fee2e2;
            color: #b91c1c;
          }
        `}
      </style>

      <div
        className={`fixed inset-x-0 top-6 flex justify-center items-start z-50 px-4 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-white rounded-xl credit-alert transform transition-all border border-gray-100 overflow-hidden w-full shadow-xl">
          <div
            className={`credit-alert-header ${
              error
                ? "bg-red-500"
                : isGoodCredit
                ? "bg-green-500"
                : "bg-red-500"
            } text-white flex justify-between items-center`}
          >
            <div className="flex items-center">
              <span className="font-semibold text-base">
                {error ? "Error" : "Credit Prediction Results"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-100 focus:outline-none p-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="credit-alert-body">
            {isLoading ? (
              <div className="flex items-center py-8 justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-4"></div>
                <span className="text-gray-600 text-lg">
                  Processing credit prediction...
                </span>
              </div>
            ) : error ? (
              <div className="text-red-600 flex items-center bg-red-50 p-4 rounded-lg">
                <svg
                  className="w-6 h-6 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v3a1 1 0 102 0V11a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="text-base">{error}</span>
              </div>
            ) : prediction && predictionData ? (
              <div>
                <div className="text-center mb-6">
                  <div className="success-icon">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Prediction Status: {prediction.status}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {prediction.count} result{prediction.count !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                </div>

                <div className="credit-info-grid">
                  <div className="credit-info-card">
                    <div className="credit-info-label">Client ID</div>
                    <div className="credit-info-value">
                      {predictionData.client_id || "N/A"}
                    </div>
                  </div>
                  <div className="credit-info-card">
                    <div className="credit-info-label">Credit Status</div>
                    <div className="mt-1">
                      <span
                        className={`status-badge ${
                          isGoodCredit
                            ? "status-badge-good"
                            : "status-badge-bad"
                        }`}
                      >
                        {isGoodCredit ? "Good" : "Bad"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="credit-score-container">
                  <div className="credit-score-header">
                    <div className="credit-info-label">Credit Risk</div>
                    <div className="font-bold text-2xl">
                      {score.toFixed(5)}
                      <span className="text-gray-400 text-sm ml-1.5">/ 1</span>
                    </div>
                  </div>
                  <div className="credit-score-bar">
                    <div
                      className={`credit-score-progress ${
                        score < 0.5
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : "bg-gradient-to-r from-red-400 to-red-500"
                      }`}
                      style={{
                        width: `${score * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400 px-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="credit-message">
                  <p className="font-medium mb-1">Analysis Results:</p>
                  <p>
                    {isGoodCredit
                      ? "Based on the provided information, this client has a good credit profile and is likely to be approved."
                      : "Based on the provided information, this client has a higher risk profile. Consider additional verification or adjusting terms."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 flex items-center justify-center py-8">
                <svg
                  className="w-6 h-6 mr-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-lg">No credit data available</span>
              </div>
            )}
          </div>

          <div className="credit-alert-footer">
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
              }}
            >
              New Prediction
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Home: React.FC = () => {
  const {
    formData,
    isSubmitting,
    submitSuccess,
    error,
    prediction,
    handleInputChange,
    handleSubmit,
    resetForm,
    errors, // <-- Add this line to destructure errors from useClientForm
  } = useClientForm();

  const [showAlert, setShowAlert] = useState(false);

  // Show alert when prediction is received
  useEffect(() => {
    if (submitSuccess && prediction) {
      setShowAlert(true);
    }
  }, [submitSuccess, prediction]);

  return (
    <div className="container mx-auto p-4 mt-12 relative">
      <h1 className="text-2xl font-bold mb-6">Credit Prediction Form</h1>

      {/* Overlay para cuando el modal está abierto */}
      {showAlert && (
        <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm z-40"></div>
      )}

      {/* Prediction Alert Modal */}
      <PredictionAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        prediction={prediction}
        isLoading={isSubmitting}
        error={error}
      />

      {error && !showAlert && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Formulario siempre visible - eliminar condición */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ${
          showAlert ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information */}
          <div className="mt-4 mr-4 ml-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="ID_CLIENT"
            >
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              id="ID_CLIENT"
              name="ID_CLIENT"
              type="text"
              value={formData.ID_CLIENT}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10 ${
                errors.ID_CLIENT ? "border-red-500" : ""
              }`}
            />
            {errors.ID_CLIENT && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.ID_CLIENT}
              </p>
            )}
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="CLERK_TYPE"
            >
              Clerk Type
            </label>
            <input
              id="CLERK_TYPE"
              name="CLERK_TYPE"
              type="text"
              value={formData.CLERK_TYPE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PAYMENT_DAY"
            >
              Payment Day
            </label>
            <input
              id="PAYMENT_DAY"
              name="PAYMENT_DAY"
              type="number"
              value={formData.PAYMENT_DAY ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="APPLICATION_SUBMISSION_TYPE"
            >
              Submission Type
            </label>
            <input
              id="APPLICATION_SUBMISSION_TYPE"
              name="APPLICATION_SUBMISSION_TYPE"
              type="text"
              value={formData.APPLICATION_SUBMISSION_TYPE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Personal Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="SEX"
            >
              Gender
            </label>
            <select
              id="SEX"
              name="SEX"
              value={formData.SEX}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            >
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="AGE"
            >
              Age
            </label>
            <input
              id="AGE"
              name="AGE"
              type="number"
              step="0.1"
              value={formData.AGE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="MARITAL_STATUS"
            >
              Marital Status
            </label>
            <input
              id="MARITAL_STATUS"
              name="MARITAL_STATUS"
              type="number"
              step="0.1"
              value={formData.MARITAL_STATUS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="QUANT_DEPENDANTS"
            >
              Number of Dependants
            </label>
            <input
              id="QUANT_DEPENDANTS"
              name="QUANT_DEPENDANTS"
              type="number"
              value={formData.QUANT_DEPENDANTS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="EDUCATION_LEVEL"
            >
              Education Level
            </label>
            <input
              id="EDUCATION_LEVEL"
              name="EDUCATION_LEVEL"
              type="number"
              value={formData.EDUCATION_LEVEL ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="STATE_OF_BIRTH"
            >
              State of Birth
            </label>
            <input
              id="STATE_OF_BIRTH"
              name="STATE_OF_BIRTH"
              type="text"
              value={formData.STATE_OF_BIRTH}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="CITY_OF_BIRTH"
            >
              City of Birth
            </label>
            <input
              id="CITY_OF_BIRTH"
              name="CITY_OF_BIRTH"
              type="text"
              value={formData.CITY_OF_BIRTH}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="NACIONALITY"
            >
              Nationality
            </label>
            <input
              id="NACIONALITY"
              name="NACIONALITY"
              type="number"
              step="0.1"
              value={formData.NACIONALITY ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Residential Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="RESIDENCIAL_STATE"
            >
              Residential State
            </label>
            <input
              id="RESIDENCIAL_STATE"
              name="RESIDENCIAL_STATE"
              type="text"
              value={formData.RESIDENCIAL_STATE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="RESIDENCIAL_CITY"
            >
              Residential City
            </label>
            <input
              id="RESIDENCIAL_CITY"
              name="RESIDENCIAL_CITY"
              type="text"
              value={formData.RESIDENCIAL_CITY}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="RESIDENCIAL_BOROUGH"
            >
              Residential Borough
            </label>
            <input
              id="RESIDENCIAL_BOROUGH"
              name="RESIDENCIAL_BOROUGH"
              type="text"
              value={formData.RESIDENCIAL_BOROUGH}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="RESIDENCIAL_ZIP_3"
            >
              Residential ZIP (3 digits)
            </label>
            <input
              id="RESIDENCIAL_ZIP_3"
              name="RESIDENCIAL_ZIP_3"
              type="number"
              value={formData.RESIDENCIAL_ZIP_3 ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="POSTAL_ADDRESS_TYPE"
            >
              Postal Address Type
            </label>
            <input
              id="POSTAL_ADDRESS_TYPE"
              name="POSTAL_ADDRESS_TYPE"
              type="number"
              value={formData.POSTAL_ADDRESS_TYPE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="RESIDENCE_TYPE"
            >
              Residence Type
            </label>
            <input
              id="RESIDENCE_TYPE"
              name="RESIDENCE_TYPE"
              type="number"
              step="0.1"
              value={formData.RESIDENCE_TYPE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="MONTHS_IN_RESIDENCE"
            >
              Months in Residence
            </label>
            <input
              id="MONTHS_IN_RESIDENCE"
              name="MONTHS_IN_RESIDENCE"
              type="number"
              step="0.1"
              value={formData.MONTHS_IN_RESIDENCE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Contact Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_RESIDENCIAL_PHONE"
            >
              Has Residential Phone
            </label>
            <select
              id="FLAG_RESIDENCIAL_PHONE"
              name="FLAG_RESIDENCIAL_PHONE"
              value={formData.FLAG_RESIDENCIAL_PHONE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="RESIDENCIAL_PHONE_AREA_CODE"
            >
              Residential Phone Area Code
            </label>
            <input
              id="RESIDENCIAL_PHONE_AREA_CODE"
              name="RESIDENCIAL_PHONE_AREA_CODE"
              type="number"
              step="0.1"
              value={formData.RESIDENCIAL_PHONE_AREA_CODE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_MOBILE_PHONE"
            >
              Has Mobile Phone
            </label>
            <select
              id="FLAG_MOBILE_PHONE"
              name="FLAG_MOBILE_PHONE"
              value={formData.FLAG_MOBILE_PHONE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_EMAIL"
            >
              Has Email
            </label>
            <input
              id="FLAG_EMAIL"
              name="FLAG_EMAIL"
              type="number"
              step="0.1"
              value={formData.FLAG_EMAIL ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Financial Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PERSONAL_MONTHLY_INCOME"
            >
              Monthly Income
            </label>
            <input
              id="PERSONAL_MONTHLY_INCOME"
              name="PERSONAL_MONTHLY_INCOME"
              type="number"
              step="0.01"
              value={formData.PERSONAL_MONTHLY_INCOME ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="OTHER_INCOMES"
            >
              Other Income
            </label>
            <input
              id="OTHER_INCOMES"
              name="OTHER_INCOMES"
              type="number"
              step="0.1"
              value={formData.OTHER_INCOMES ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PERSONAL_ASSETS_VALUE"
            >
              Personal Assets Value
            </label>
            <input
              id="PERSONAL_ASSETS_VALUE"
              name="PERSONAL_ASSETS_VALUE"
              type="number"
              step="0.1"
              value={formData.PERSONAL_ASSETS_VALUE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="QUANT_CARS"
            >
              Number of Cars
            </label>
            <input
              id="QUANT_CARS"
              name="QUANT_CARS"
              type="number"
              step="0.1"
              value={formData.QUANT_CARS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Credit Card Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="HAS_CREDIT_CARD"
            >
              Has Credit Card
            </label>
            <select
              id="HAS_CREDIT_CARD"
              name="HAS_CREDIT_CARD"
              value={formData.HAS_CREDIT_CARD ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            >
              <option value="">Select</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_VISA"
            >
              Has Visa Card
            </label>
            <input
              id="FLAG_VISA"
              name="FLAG_VISA"
              type="number"
              step="0.1"
              value={formData.FLAG_VISA ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_MASTERCARD"
            >
              Has Mastercard
            </label>
            <input
              id="FLAG_MASTERCARD"
              name="FLAG_MASTERCARD"
              type="number"
              step="0.1"
              value={formData.FLAG_MASTERCARD ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_DINERS"
            >
              Has Diners Card
            </label>
            <input
              id="FLAG_DINERS"
              name="FLAG_DINERS"
              type="number"
              step="0.1"
              value={formData.FLAG_DINERS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_AMERICAN_EXPRESS"
            >
              Has American Express
            </label>
            <input
              id="FLAG_AMERICAN_EXPRESS"
              name="FLAG_AMERICAN_EXPRESS"
              type="number"
              step="0.1"
              value={formData.FLAG_AMERICAN_EXPRESS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_OTHER_CARDS"
            >
              Has Other Cards
            </label>
            <input
              id="FLAG_OTHER_CARDS"
              name="FLAG_OTHER_CARDS"
              type="number"
              step="0.1"
              value={formData.FLAG_OTHER_CARDS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="QUANT_ADDITIONAL_CARDS"
            >
              Additional Cards
            </label>
            <input
              id="QUANT_ADDITIONAL_CARDS"
              name="QUANT_ADDITIONAL_CARDS"
              type="number"
              value={formData.QUANT_ADDITIONAL_CARDS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Banking Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="QUANT_BANKING_ACCOUNTS"
            >
              Number of Banking Accounts
            </label>
            <input
              id="QUANT_BANKING_ACCOUNTS"
              name="QUANT_BANKING_ACCOUNTS"
              type="number"
              step="0.1"
              value={formData.QUANT_BANKING_ACCOUNTS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="QUANT_SPECIAL_BANKING_ACCOUNTS"
            >
              Special Banking Accounts
            </label>
            <input
              id="QUANT_SPECIAL_BANKING_ACCOUNTS"
              name="QUANT_SPECIAL_BANKING_ACCOUNTS"
              type="number"
              step="0.1"
              value={formData.QUANT_SPECIAL_BANKING_ACCOUNTS ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Professional Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="COMPANY"
            >
              Company
            </label>
            <input
              id="COMPANY"
              name="COMPANY"
              type="text"
              value={formData.COMPANY}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PROFESSIONAL_STATE"
            >
              Professional State
            </label>
            <input
              id="PROFESSIONAL_STATE"
              name="PROFESSIONAL_STATE"
              type="text"
              value={formData.PROFESSIONAL_STATE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PROFESSIONAL_CITY"
            >
              Professional City
            </label>
            <input
              id="PROFESSIONAL_CITY"
              name="PROFESSIONAL_CITY"
              type="text"
              value={formData.PROFESSIONAL_CITY}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PROFESSIONAL_BOROUGH"
            >
              Professional Borough
            </label>
            <input
              id="PROFESSIONAL_BOROUGH"
              name="PROFESSIONAL_BOROUGH"
              type="text"
              value={formData.PROFESSIONAL_BOROUGH}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PROFESSIONAL_ZIP_3"
            >
              Professional ZIP (3 digits)
            </label>
            <input
              id="PROFESSIONAL_ZIP_3"
              name="PROFESSIONAL_ZIP_3"
              type="number"
              step="0.1"
              value={formData.PROFESSIONAL_ZIP_3 ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_PROFESSIONAL_PHONE"
            >
              Has Professional Phone
            </label>
            <select
              id="FLAG_PROFESSIONAL_PHONE"
              name="FLAG_PROFESSIONAL_PHONE"
              value={formData.FLAG_PROFESSIONAL_PHONE}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PROFESSIONAL_PHONE_AREA_CODE"
            >
              Professional Phone Area Code
            </label>
            <input
              id="PROFESSIONAL_PHONE_AREA_CODE"
              name="PROFESSIONAL_PHONE_AREA_CODE"
              type="number"
              step="0.1"
              value={formData.PROFESSIONAL_PHONE_AREA_CODE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="MONTHS_IN_THE_JOB"
            >
              Months in Job
              <span className="text-gray-400 text-sm ml-1.5">(approx.)</span>
            </label>
            <input
              id="MONTHS_IN_THE_JOB"
              name="MONTHS_IN_THE_JOB"
              type="number"
              step="0.1"
              value={formData.MONTHS_IN_THE_JOB ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PROFESSION_CODE"
            >
              Profession Code
            </label>
            <input
              id="PROFESSION_CODE"
              name="PROFESSION_CODE"
              type="number"
              value={formData.PROFESSION_CODE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="OCCUPATION_TYPE"
            >
              Occupation Type
            </label>
            <input
              id="OCCUPATION_TYPE"
              name="OCCUPATION_TYPE"
              type="number"
              step="0.1"
              value={formData.OCCUPATION_TYPE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Spouse Information */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="MATE_PROFESSION_CODE"
            >
              Spouse Profession Code
            </label>
            <input
              id="MATE_PROFESSION_CODE"
              name="MATE_PROFESSION_CODE"
              type="number"
              value={formData.MATE_PROFESSION_CODE ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="MATE_EDUCATION_LEVEL"
            >
              Spouse Education Level
            </label>
            <input
              id="MATE_EDUCATION_LEVEL"
              name="MATE_EDUCATION_LEVEL"
              type="number"
              value={formData.MATE_EDUCATION_LEVEL ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          {/* Documents and Records */}
          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_HOME_ADDRESS_DOCUMENT"
            >
              Home Address Document
            </label>
            <input
              id="FLAG_HOME_ADDRESS_DOCUMENT"
              name="FLAG_HOME_ADDRESS_DOCUMENT"
              type="number"
              step="0.1"
              value={formData.FLAG_HOME_ADDRESS_DOCUMENT ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_RG"
            >
              Has RG Document
            </label>
            <input
              id="FLAG_RG"
              name="FLAG_RG"
              type="number"
              step="0.1"
              value={formData.FLAG_RG ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_CPF"
            >
              Has CPF Document
            </label>
            <input
              id="FLAG_CPF"
              name="FLAG_CPF"
              type="number"
              step="0.01"
              value={formData.FLAG_CPF ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_INCOME_PROOF"
            >
              Has Income Proof
            </label>
            <input
              id="FLAG_INCOME_PROOF"
              name="FLAG_INCOME_PROOF"
              type="number"
              step="0.01"
              value={formData.FLAG_INCOME_PROOF ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="PRODUCT"
            >
              Product
            </label>
            <input
              id="PRODUCT"
              name="PRODUCT"
              type="number"
              step="0.1"
              value={formData.PRODUCT ?? ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            />
          </div>

          <div className="mt-4 mr-4 ml-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="FLAG_ACSP_RECORD"
            >
              Has ACSP Record
            </label>
            <select
              id="FLAG_ACSP_RECORD"
              name="FLAG_ACSP_RECORD"
              value={formData.FLAG_ACSP_RECORD}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>

          {/* Buttons */}
          <div
            className="col-span-full"
            style={{
              marginBottom: "1.5rem",
              paddingRight: "1rem",
              paddingLeft: "1rem",
              borderTop: "1px solid #edf2f7",
              paddingTop: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <div
                className="inline-flex shadow-md rounded-md"
                style={{
                  marginRight: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem 0 0 0.375rem",
                    transition: "all 200ms",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f9fafb")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffffff")
                  }
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "white",
                    backgroundColor: isSubmitting ? "#60a5fa" : "#2563eb",
                    borderRadius: "0 0.375rem 0.375rem 0",
                    transition: "all 200ms",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = "#1d4ed8";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                    }
                  }}
                >
                  {isSubmitting ? (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <svg
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          marginRight: "0.5rem",
                          animation: "spin 1s linear infinite",
                        }}
                        viewBox="0 0 24 24"
                      >
                        <circle
                          style={{ opacity: "0.25" }}
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          style={{ opacity: "0.75" }}
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Submit Prediction"
                  )}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </form>
    </div>
  );
};

export default Home;
