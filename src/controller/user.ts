import { Request, Response } from "express";
import { errorResponse, successResponse } from "../config/response";
import UserModel from "../db/models/user";

const createUser = async (req: Request, res: Response) => {
  try {
   
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const userController = {
  createUser,
};

export default userController;
