import { Request, Response } from "express";
import { errorResponse, successResponse } from "../config/response";
import UserModel from "../db/models/user";

const createUser = async (req: Request, res: Response) => {
  try {
    const { tenantId, name, email, passwordHash, role } = req.body;
    const user = await UserModel.create({
      tenantId,
      name,
      email,
      passwordHash,
      role,
      isActive: true,
      lastLoginAt: Date.now(),
    });
    return successResponse(res, "User created Successfully", user);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const userController = {
  createUser,
};

export default userController;
