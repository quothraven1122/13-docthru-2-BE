import express from "express";
import { authController } from "./authController.js";
import { validate } from "#src/common/middlewares/validate.js";
import { authSchema } from "./authSchema.js";

const authRouter = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 이메일/닉네임 중복 확인 후 유저를 생성하고 access token(응답 바디)과 refresh token(쿠키)을 발급합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         headers:
 *           Set-Cookie:
 *             description: refreshToken이 httpOnly 쿠키로 설정됩니다.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RegisterResponse"
 *       400:
 *         description: 요청 데이터 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       409:
 *         description: 이미 사용 중인 이메일 또는 닉네임
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
authRouter.post("/register", validate(authSchema.registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일/비밀번호로 로그인하여 access token(응답 바디)과 refresh token(쿠키)을 발급합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             description: refreshToken이 httpOnly 쿠키로 설정됩니다.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RegisterResponse"
 *       400:
 *         description: 요청 데이터 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: 이메일 또는 비밀번호가 올바르지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
authRouter.post("/login", validate(authSchema.loginSchema), authController.login);

export default authRouter;
