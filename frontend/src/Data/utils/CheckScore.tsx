import React, { useState, useEffect } from "react";

interface ClientScoreData {
  msg: string;
  client_id: string;
  client_credit_status: string;
  client_score: string;
}

interface ScoreAlertProps {
  isOpen: boolean;
  onClose: () => void;
  data: ClientScoreData | null;
  isLoading: boolean;
  error: string | null;
}

export const checkClientScore = async (
  clientId: string
): Promise<ClientScoreData> => {
  try {
    const response = await fetch(
      `https://creda-development.up.railway.app/api/clients/get-client-data?client_id=${clientId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to fetch client data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking client score:", error);
    throw error;
  }
};

export const ScoreModal: React.FC<ScoreAlertProps> = ({
  isOpen,
  onClose,
  data,
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
        `}
      </style>

      <div
        className={`fixed inset-x-0 top-6 flex justify-center items-start z-50 px-4 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-white rounded-xl credit-alert transform transition-all border border-gray-100 overflow-hidden w-full">
          <div
            className={`credit-alert-header ${
              error
                ? "bg-red-500"
                : data?.client_credit_status === "good"
                ? "bg-green-500"
                : "bg-red-500"
            } text-white flex justify-between items-center`}
          >
            <div className="flex items-center">
              <span className="font-semibold text-base">
                {error ? "Error" : "Client Credit Status"}
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
                  Retrieving credit information...
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
            ) : data ? (
              <div>
                <div className="credit-info-grid">
                  <div className="credit-info-card">
                    <div className="credit-info-label">Client ID</div>
                    <div className="credit-info-value">{data.client_id}</div>
                  </div>
                  <div className="credit-info-card">
                    <div className="credit-info-label">Credit Status</div>
                    <div
                      className={`credit-info-value ${
                        data.client_credit_status === "good"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {data.client_credit_status === "good" ? "Good" : "Bad"}
                    </div>
                  </div>
                </div>

                <div className="credit-score-container">
                  <div className="credit-score-header">
                    <div className="credit-info-label">Credit risk</div>
                    <div className="font-bold text-2xl">
                      {data.client_score}
                      <span className="text-gray-400 text-sm ml-1.5">/ 1</span>
                    </div>
                  </div>
                  <div className="credit-score-bar">
                    <div
                      className={`credit-score-progress ${
                        parseFloat(data.client_score) < 0.5
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : "bg-gradient-to-r from-red-400 to-red-500"
                      }`}
                      style={{
                        width: `${parseFloat(data.client_score) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400 px-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {data.msg && <div className="credit-message">{data.msg}</div>}
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
                <span className="text-lg">No client data available</span>
              </div>
            )}
          </div>

          <div className="credit-alert-footer">
            <button className="btn btn-dismiss" onClick={onClose}>
              Dismiss
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
