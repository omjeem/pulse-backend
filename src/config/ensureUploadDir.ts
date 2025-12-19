import fs from "fs";
import path from "path";

const dirs = [
  path.resolve(process.cwd(), "dist_uploads"),
  path.resolve(process.cwd(), "dist_uploads/tmp"),
  path.resolve(process.cwd(), "dist_uploads/videos"),
];

export function ensureUploadDirs() {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
