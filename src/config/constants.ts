import path from "path";

const Constants = {
  STATUS_CODES: {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
  },
  TEMP_DIR: path.resolve(process.cwd(), "dist_uploads/tmp"),
  FINAL_DIR: path.resolve(process.cwd(), "dist_uploads/videos"),
};

export default Constants;
