import express from "express";
import userRouter from "./routes/user";
import videoRouter from "./routes/video";
import tenantRouter from "./routes/tenant";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/video", videoRouter);
mainRouter.use("/tenant", tenantRouter)


export default mainRouter;