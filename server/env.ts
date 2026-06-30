/**
 * Load environment variables from `.env` before any other server module runs.
 * Import this file first in server/index.ts.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("🔧 Loaded environment from .env");
} else {
  dotenv.config(); // fallback — optional .env in cwd
}

export const ENV_FILE = envPath;
