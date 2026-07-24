import express from "express";
import { userController } from "./userController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";

const userRouter = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: accessToken 쿠키로 인증된 로그인 유저 본인의 정보를 조회합니다.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: 토큰은 유효하지만 대상 유저가 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
userRouter.get("/me", authenticate, userController.getMe);

export default userRouter;
