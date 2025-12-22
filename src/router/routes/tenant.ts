import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import controllers from "../../controller";
import { adminOwnerMiddleware } from "../../middlewares/adminOwnerMiddleware";

const tenantRouter = express.Router();

tenantRouter.use(authMiddleware);

tenantRouter.post("/", controllers.tenant.createNewTenant);
tenantRouter.get("/", controllers.tenant.getAllRelatedTenant);
tenantRouter.post(
  "/members/:tenantId",
  adminOwnerMiddleware,
  controllers.tenant.addNewMember
);
tenantRouter.get("/members/:tenantId", controllers.tenant.getAllTenantMembers);

export default tenantRouter;
