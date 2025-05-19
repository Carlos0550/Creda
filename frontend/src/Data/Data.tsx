import React, { useState, useEffect } from "react";
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
import {
  url_predict,
  globalApis,
  csvProcessingEndpoints,
} from "../Context/APIs";

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
  const [clients, setClients] = useState<any[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false);

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

  const loadClientsFromDatabase = async () => {
    setIsLoadingClients(true);
    setError(null);

    try {
      const response = await fetch(
        csvProcessingEndpoints.getAllClients.toString()
      );

      if (!response.ok) {
        throw new Error(`Error getting customers, please upload a csv file and refresh the table.`);
      }

      const data = await response.json();

      if (data.clients && data.clients.length > 0) {
        setClients(data.clients);
        setTotalRows(data.rowsCount || data.clients.length);
      } else {
        setClients([]);
        setTotalRows(0);
      }
    } catch (err: any) {
      console.error("Error cargando clientes:", err);
      setError(err.message || "Error al cargar clientes");
    } finally {
      setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    loadClientsFromDatabase();
  }, []);

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile) {
      setUploadError("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setPredictionResults(null);
    setShowResults(false);

    try {
      // Cargar el CSV en la tabla para vista previa
      const parsedData = await loadDataset({ file: csvFile });
      if (Array.isArray(parsedData)) {
        setData(parsedData);
        setTotalRows(parsedData.length);
      } else {
        throw new Error("Parsed data is not an array");
      }

      const formData = new FormData();
      formData.append("file", csvFile);

      // PASO 1: Guardar el CSV en el backend primero
      const backendResponse = await fetch(`${globalApis.clients}/save-csv`, {
        method: "POST",
        body: formData,
      });

      if (!backendResponse.ok) {
        throw new Error(
          `Error saving file: ${
            backendResponse.status
          } - ${await backendResponse.text()}`
        );
      }

      const saveResult = await backendResponse.json();

      // PASO 2: Esperar un tiempo para que el worker procese los datos
      setPredictionResults({ processing: true });
      setShowResults(true);

      // Esperar 10 segundos y luego cargar los clientes
      setTimeout(() => {
        loadClientsFromDatabase();
        setPredictionResults({ completed: true });
      }, 10000);
    } catch (err: any) {
      console.error("Error en el proceso:", err);
      setUploadError(err.message || "Error processing CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  // Actualización de las columnas para usar los nombres exactos del JSON
  const clientColumns: GridColDef[] = [
    {
      field: "client_id",
      headerName: "Client ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "client_credit_scoring",
      headerName: "Credit risk",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const score = parseFloat(params.value) * 100;
        return `${score.toFixed(2)}%`;
      },
    },
    {
      field: "client_credit_status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const status = params.value;
        return (
          <span
            className={`py-1 px-3 rounded-full text-sm font-medium ${
              status === "good"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.toUpperCase()}
          </span>
        );
      },
    },
  ];

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
                <label className="bg-white border border-gray-300 rounded-lg py-2 px-4 text-base shadow-sm hover:bg-gray-50 cursor-pointer inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Choose file
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) =>
                      setCsvFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </label>
                {csvFile && (
                  <span className="ml-2 text-sm text-gray-600">
                    {csvFile.name}
                  </span>
                )}
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

      {/* Resultados de procesamiento */}
      {showResults && predictionResults && (
        <div className="mb-6 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-green-800">
              {predictionResults.processing
                ? "Processing prediction..."
                : "Prediction completed"}
            </h3>
          </div>

          {predictionResults.processing && (
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-green-600"
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
              <p>
                The file is being processed. The table will be updated
                automatically.
              </p>
            </div>
          )}

          {predictionResults.completed && (
            <div className="text-green-700 flex items-center justify-between">
              <p>
                Processing has completed. The table is updated with the results.
              </p>
              <button
                onClick={loadClientsFromDatabase}
                className="ml-4 bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md min-w-[120px] transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabla de clientes */}
      {isLoadingClients ? (
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
      ) : clients.length === 0 ? (
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
            No se encontraron clientes. Suba un archivo CSV para procesar.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <DataGrid
            rows={clients.map((client, index) => ({
              id: index,
              ...client,
            }))}
            columns={clientColumns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            disableRowSelectionOnClick
            autoHeight
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
            }}
          />
        </div>
      )}

      {/* Modal para verificar score */}
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
