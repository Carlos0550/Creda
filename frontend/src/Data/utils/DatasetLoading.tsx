import Papa from "papaparse";

// Modificamos la interfaz para hacer el archivo requerido, no opcional
interface LoadDatasetOptions {
  file: File; // Ya no es opcional
}

export const loadDataset = async (options: LoadDatasetOptions) => {
  try {
    // Verificamos que se haya proporcionado un archivo
    if (!options || !options.file) {
      throw new Error("No file provided for upload");
    }

    console.log("Loading CSV from user upload:", options.file.name);

    // Leemos el contenido del archivo
    const csvText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(options.file);
    });

    if (!csvText || csvText.trim().length === 0) {
      throw new Error("The CSV file is empty");
    }

    console.log(
      "CSV loaded successfully. Size:",
      (csvText.length / 1024).toFixed(2),
      "KB"
    );

    // Parseamos el contenido del CSV
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.warn("CSV parsing warnings:", results.errors);
          }

          if (!results.data || results.data.length === 0) {
            console.error("No data found after parsing CSV");
            reject(new Error("No data found in the CSV"));
            return;
          }

          console.log("Successfully parsed", results.data.length, "records");
          console.log("Sample first record:", results.data[0]);

          resolve(results.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error loading dataset:", error);
    throw error;
  }
};
