import fs from "fs";
import path from "path";

export const getQueries = (dir: string): Record<string, string[]> => {
  const queries: Record<string, string[]> = {};
  const folderPath = path.resolve(__dirname, dir);

  const files = fs.readdirSync(folderPath);
  const sqlFiles = files.filter((f) => f.endsWith(".sql"));

  for (const file of sqlFiles) {
    const fullPath = path.join(folderPath, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const queryArray = content
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    queries[file] = queryArray;
  }

  return queries;
};