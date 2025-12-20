import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import Constants from "../../config/constants";
import services from "../../services";

const create = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = services.jwtService.hashPassword(password, email);
    const user = await services.user.createUser(name, email, hashedPassword);
    const token = await services.jwtService.generateJwt(email, user._id);
    return successResponse(res, "User created Successfully", { token });
  } catch (error: any) {
    console.log({ error });
    let message = error.message;
    if (error.code === 11000) {
      message =
        "User with this email already registered! please try with different one";
    }
    return errorResponse(res, message);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userDetails = await services.user.findByEmail(email);
    if (!userDetails) {
      throw new Error("User not found of this given email");
    }
    const isPasswordMatched = services.jwtService.verifyPassword(
      password,
      email,
      userDetails.password!
    );

    if (!isPasswordMatched) {
      throw new Error("Invalid Password");
    }

    const token = await services.jwtService.generateJwt(
      email,
      userDetails._id!
    );
    return successResponse(res, "User Loggedin Successfully!", { token });
  } catch (error: any) {
    return errorResponse(
      res,
      error.message,
      Constants.STATUS_CODES.UNAUTHORIZED
    );
  }
};

const profileDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const userData = await services.user.findByUserId(userId);
    return successResponse(res, "User profile fetched successfully", userData);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await services.user.getAllUsers();
    return successResponse(res, "All users fetched Successfully", users);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
const user = {
  create,
  login,
  profileDetails,
  getAllUsers,
};

export default user;
