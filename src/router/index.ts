import express from "express";
import userRouter from "./routes/user";
import videoRouter from "./routes/video";
import tenantRouter from "./routes/tenant";
import teamRouter from "./routes/team";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/video", videoRouter);
mainRouter.use("/tenant", tenantRouter)
mainRouter.use("/team", teamRouter)


export default mainRouter;