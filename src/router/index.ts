import express from "express";
import userRouter from "./routes/user";
import videoRouter from "./routes/video";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/video", videoRouter);


export default mainRouter;