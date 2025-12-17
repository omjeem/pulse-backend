import express from "express";
import cors from "cors";
import { envConfigs } from "./config/envConfig";
import mainRouter from "./routes";
import connectMongoDb from "./db";

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
});
