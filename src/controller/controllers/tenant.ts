import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import services from "../../services";

const createNewTenant = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name, slug, metadata } = req.body;
    const newTenant = await services.tenant.createNew(
      name,
      slug,
      metadata,
      userId
    );
    return successResponse(res, "New Tenant created successfully", newTenant);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const getAllRelatedTenant = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const getAll = await services.tenant.getAllUserTenant(userId);
    return successResponse(
      res,
      "User Related tenant fetched successfully!",
      getAll
    );
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const tenant = {
  createNewTenant,
  getAllRelatedTenant
};

export default tenant;
