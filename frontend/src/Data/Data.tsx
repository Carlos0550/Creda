import React, { useState } from "react";
import { loadDataset } from "./utils/DatasetLoading";
import { ScoreModal, checkClientScore } from "./utils/CheckScore"; 
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarQuickFilter,
  GridLogicOperator,
} from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { url_predict } from "../Context/APIs"; 

// Custom toolbar with prominent search
function CustomToolbar() {
  return (
    <Box
      sx={{
        p: 1,
        pb: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Buscar en todos los campos:
      </Typography>
      <Box
        sx={{
          width: "100%",
          mb: 2,
          "& .MuiInputBase-root": {
            height: 40,
            width: "100%",
            maxWidth: 500,
          },
        }}
      >
        <GridToolbarQuickFilter
          quickFilterParser={(searchInput) =>
            searchInput
              .split(",")
              .map((value) => value.trim())
              .filter((value) => value !== "")
          }
          debounceMs={200}
        />
      </Box>
      <GridToolbar />
    </Box>
  );
}

function Data() {
  const [data, setData] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0); 
  const [clientId, setClientId] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleCheckScore = async () => {
    if (!clientId.trim()) {
      setScoreError("Please enter a Client ID");
      setIsModalOpen(true);
      return;
    }

    setIsChecking(true);
    setScoreError(null);
    setScoreData(null);
    setIsModalOpen(true);

    try {
      const result = await checkClientScore(clientId);
      setScoreData(result);
    } catch (err: any) {
      console.error("Error checking client score:", err);
      setScoreError(err.message || "Failed to retrieve client score");
    } finally {
      setIsChecking(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile) {
      setUploadError("Por favor seleccione un archivo CSV");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setPredictionResults(null);
    setShowResults(false);

    try {
      // Cargar el CSV en la tabla
      const parsedData = await loadDataset({ file: csvFile });
      if (Array.isArray(parsedData)) {
        setData(parsedData);
        setTotalRows(parsedData.length);
      } else {
        throw new Error("Parsed data is not an array");
      }

      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch(url_predict, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${await response.text()}`);
      }

      const results = await response.json();
      console.log("Prediction results:", results);
      setPredictionResults(results);
      setShowResults(true);
    } catch (err: any) {
      console.error("Error uploading CSV:", err);
      setUploadError(err.message || "Error al subir el archivo CSV");
    } finally {
      setIsUploading(false);
    }
  };

  const columns: GridColDef[] =
    data.length > 0
      ? Object.keys(data[0])
          .filter((key) => key !== "id")
          .map((key) => ({
            field: key,
            headerName:
              key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
            flex: 1,
            minWidth: 120,
          }))
      : [];

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <h1 className="text-2xl font-bold mb-2">Dataset</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <p className="text-gray-600 mb-3 md:mb-0">
          List of clients for credit risk analysis
          {totalRows > 0 && ` (${totalRows.toLocaleString()} total records)`}
        </p>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                className="border border-gray-300 rounded-lg py-3 pl-12 pr-4 w-72 text-base shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ textIndent: "0.5rem" }}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 text-base font-medium rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center min-w-[140px] cursor-pointer"
              onClick={handleCheckScore}
              disabled={isChecking}
            >
              {isChecking ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Checking...
                </div>
              ) : (
                "Check Score"
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <form
              onSubmit={handleCsvUpload}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  className="border border-gray-300 rounded-lg py-2 px-3 text-base shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) =>
                    setCsvFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-base font-medium rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center min-w-[140px] cursor-pointer"
                disabled={isUploading || !csvFile}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  "Predict CSV"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

{showResults && predictionResults && (
  <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-lg text-green-800">
        Prediction results
      </h3>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left font-semibold text-gray-700">ID Client</th>
            <th className="py-2 px-4 border-b text-left font-semibold text-gray-700">Credit Scoring</th>
            <th className="py-2 px-4 border-b text-left font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {predictionResults.predictions.map((client) => (
            <tr key={client.client_id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{client.client_id}</td>
              <td className="py-2 px-4 border-b">{(client.client_credit_scoring * 100).toFixed(2)}%</td>
              <td className={`py-2 px-4 border-b ${
                client.client_credit_status === "good" 
                  ? "text-green-600 font-medium" 
                  : "text-red-600 font-medium"
              }`}>
                {client.client_credit_status.toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <div className="mt-2 text-sm text-gray-600">
      Total clientes analizados: {predictionResults.count}
    </div>
  </div>
)}

      {uploadError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {uploadError}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm0 7a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            No records were found to display.
          </p>
        </div>
      ) : (
        <div
          style={{ height: 600 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <DataGrid
            rows={data}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
              filter: {
                filterModel: {
                  items: [],
                  quickFilterLogicOperator: GridLogicOperator.Or,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 300 },
              },
            }}
            getRowHeight={() => "auto"}
            sx={{
              "& .MuiDataGrid-cell": {
                padding: "8px 16px",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              ".MuiDataGrid-virtualScroller": {
                minHeight: "400px",
              },
            }}
          />
        </div>
      )}

      <ScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={scoreData}
        isLoading={isChecking}
        error={scoreError}
      />
    </div>
  );
}

export default Data;
