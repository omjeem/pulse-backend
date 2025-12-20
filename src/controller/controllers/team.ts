import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import services from "../../services";

const createNew = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { tenantId }: any = req.params;
    const { name } = req.body;
    const isBelongs = await services.tenant.isUserBelongToTenant(
      userId,
      tenantId
    );
    if (!isBelongs || isBelongs.length === 0) {
      throw new Error("Tenant not exists or not belong to you");
    }
    const userRole = isBelongs[0]?.role;
    if (userRole === "viewer") {
      throw new Error("You have view only permission not able to create team");
    }
    const team = await services.team.createNew(tenantId, name, userId);

    return successResponse(res, "Team Created Successfully", team);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const getAllTenantteam = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { tenantId }: any = req.params;
    const isBelongs = await services.tenant.isUserBelongToTenant(
      userId,
      tenantId
    );
    if (!isBelongs || isBelongs.length === 0) {
      return successResponse(res, "Team Created Successfully", []);
    }
    const userRole = isBelongs[0]?.role;
    if (userRole === "viewer") {
      throw new Error("You have view only permission not able to create team");
    }
    const team = await services.team.getAlltenantTeam(tenantId);
    
    return successResponse(res, "Team Created Successfully", team);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const team = {
  createNew,
  getAllTenantteam,
};

export default team;
