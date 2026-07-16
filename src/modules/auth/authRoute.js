import express from "express";
import { authController } from "./authController.js";
import { validate } from "../../common/middlewares/validate.js";
import { registerSchema } from "./authSchema.js";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", authController.login);

export default authRouter;
