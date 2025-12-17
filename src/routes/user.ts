import express from "express";
import userController from "../controller/user";

const userRouter = express.Router();

userRouter.post("/", userController.createUser);

export default userRouter;
