import express from "express";
import cors from "cors";
import { envConfigs } from "./config/envConfig";
import mainRouter from "./router";
import connectMongoDb from "./db";
import { ensureUploadDirs } from "./config/ensureUploadDir";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to pulse api!",
  });
});

app.use("/api", mainRouter);

app.listen(envConfigs.port, async () => {
  console.log(`Server is listening on http://localhost:${envConfigs.port}`);
  await connectMongoDb();
  ensureUploadDirs();
  // Test normalization (remove in production)
  // normalizeMp4Video("/Users/hexahealth/Documents/PP/pulse/backend/dist_uploads/videos/694424b4aa0a5d540b5f6900-1766114353521-random.mp4")
  //   .then(() => console.log("Test normalization completed"))
  //   .catch((err) => console.error("Test normalization failed:", err));
});
