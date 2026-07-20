import express from "express";
import { authController } from "./authController.js";
import { validate } from "#src/common/middlewares/validate.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";
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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: DB에 저장된 refresh token을 제거하고 refresh token 쿠키를 삭제합니다. access token(Authorization 헤더)이 필요합니다.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그아웃되었습니다.
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
authRouter.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: 토큰 재발급
 *     description: refresh token 쿠키를 검증해 새로운 access token과 refresh token을 발급합니다(refresh token은 재발급 시마다 회전됩니다).
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 재발급 성공
 *         headers:
 *           Set-Cookie:
 *             description: 새로운 refreshToken이 httpOnly 쿠키로 설정됩니다.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RegisterResponse"
 *       401:
 *         description: refresh token이 없거나 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
authRouter.post("/refresh-token", authController.refreshToken);

export default authRouter;
