import express from "express";
import { authController } from "./authController";

const authRouter = express.Route();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

export default authRouter;
