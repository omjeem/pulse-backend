import express from "express";
import cors from "cors";
import http from "http";
import { envConfigs } from "./config/envConfig";
import mainRouter from "./router";
import connectMongoDb from "./db";
import { initSocket } from "./socket";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "Welcome to pulse api!" }));
app.use("/api", mainRouter);

const server = http.createServer(app);
initSocket(server)

server.listen(envConfigs.port, async () => {
  console.log(`Server is listening on http://localhost:${envConfigs.port}`);
  await connectMongoDb();
});
