import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import controllers from "../../controller";

const teamRouter = express.Router();

teamRouter.use(authMiddleware);

teamRouter.post("/:tenantId", controllers.team.createNew);
teamRouter.get("/:tenantId", controllers.team.getAllTenantteam);


export default teamRouter;
