import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import controllers from "../../controller";

const tenantRouter = express.Router();

tenantRouter.use(authMiddleware);

tenantRouter.post("/", controllers.tenant.createNewTenant);
tenantRouter.get("/", controllers.tenant.getAllRelatedTenant);

export default tenantRouter;
