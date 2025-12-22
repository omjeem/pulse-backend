import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import services from "../../services";
import { Types } from "mongoose";

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

const addNewMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { tenantId }: any = req.params;
    const users: {
      _id: Types.ObjectId;
      role: string;
    }[] = req.body;

    users.forEach((u) => {
      if (u.role === "owner") {
        throw new Error("There Cannot be multiple owner of the Organization!");
      }
      const allowedRoles = ["owner", "admin", "editor", "viewer"];
      if (!allowedRoles.includes(u.role)) {
        throw new Error(`Only ${allowedRoles.join(" | ")} roles are allowed!`);
      }
    });

    const addUsersPayLoad = users.map((u) => {
      return {
        tenantId,
        userId: u._id,
        role: u.role,
        invitedBy: userId,
      };
    });
    // console.log({ addUsersPayLoad });
    const addUsers = await services.tenant.addNewMembers(addUsersPayLoad);
    return successResponse(res, "All members created successfully!", addUsers);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const getAllTenantMembers = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { tenantId }: any = req.params;
    const members = await services.tenant.getAllTenantMembers(tenantId);
    return successResponse(res, "All members fetched Successfully!", members);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
const tenant = {
  createNewTenant,
  getAllRelatedTenant,
  addNewMember,
  getAllTenantMembers
};

export default tenant;
