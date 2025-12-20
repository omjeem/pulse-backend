import express from "express";
import controllers from "../../controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.post("/signup", controllers.user.create);
userRouter.post("/signin", controllers.user.login);
userRouter.get("/", authMiddleware, controllers.user.profileDetails);
userRouter.get("/getAll", authMiddleware, controllers.user.getAllUsers);

export default userRouter;
