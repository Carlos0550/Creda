// copySQL.js
const fs = require("fs");
const path = require("path");

function copySQLFiles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copySQLFiles(srcPath, destPath);
    } else if (entry.name.endsWith(".sql")) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copySQLFiles("src/controllers", "dist/controllers");