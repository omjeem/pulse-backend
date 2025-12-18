import express from "express";
import controllers from "../../controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.post("/", controllers.user.create);
userRouter.post("/login", controllers.user.login);
userRouter.get("/", authMiddleware, controllers.user.profileDetails);

export default userRouter;
