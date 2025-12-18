import express from "express";
import userController from "../controller/user";

const userRouter = express.Router();

userRouter.post("/", userController.create);
userRouter.post("/login", userController.login)

export default userRouter;
