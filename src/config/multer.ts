import multer from "multer";
import Constants from "./constants";

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, Constants.TEMP_DIR),
    filename: (_req, _file, cb) => {
      cb(null, `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }
  })
});
