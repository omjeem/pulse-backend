import express from "express";
import cors from "cors";
import { envConfigs } from "./config/envConfig";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to pulse api!",
  });
});

app.listen(envConfigs.port, () => {
  console.log(`Server is listening on http://localhost:${envConfigs.port}`);
});
