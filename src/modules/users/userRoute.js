import express from "express";
import { userController } from "./userController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";

const userRouter = express.Router();

userRouter.get("/me", authenticate, userController.getMe);

export default userRouter;
