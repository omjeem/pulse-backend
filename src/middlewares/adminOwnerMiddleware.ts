import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../config/response";
import services from "../services";
import Constants from "../config/constants";

export const adminOwnerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const { tenantId }: any = req.params;
    const membershipInfo = await services.tenant.getTenantMemberInfo(
      userId,
      tenantId
    );
    console.log({membershipInfo, tenantId})
    if (!membershipInfo || membershipInfo.length === 0) {
      throw new Error("You are not associated with this Organization/Tenant");
    }
    const userRole = membershipInfo[0]?.role;
    if (userRole === "editor" || userRole === "viewer") {
      throw new Error(`You have ${userRole} role! this is admin/owner protected route`);
    }
    next();
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || error,
      Constants.STATUS_CODES.UNAUTHORIZED
    );
  }
};
