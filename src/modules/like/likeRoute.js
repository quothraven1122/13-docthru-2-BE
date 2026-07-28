import express from "express";
import { likeController } from "./likeController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";

const likeRouter = express.Router();

/**
 * @swagger
 * /like/{translationId}/count:
 *   get:
 *     summary: 좋아요 개수 조회
 *     description: 특정 번역물의 좋아요 총 개수를 조회합니다. 인증이 필요하지 않습니다.
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: translationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 좋아요 개수를 조회할 번역물 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LikeCountResponse"
 *       400:
 *         description: translationId 누락
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
likeRouter.get("/:translationId/count", likeController.getLikeCount);

/**
 * @swagger
 * /like/{translationId}/status:
 *   get:
 *     summary: 좋아요 여부 조회
 *     description: 로그인한 유저가 특정 번역물에 좋아요를 눌렀는지 조회합니다. accessToken 쿠키 인증이 필요합니다.
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: translationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 좋아요 여부를 조회할 번역물 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LikeStatusResponse"
 *       400:
 *         description: translationId 누락
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
likeRouter.get("/:translationId/status", authenticate, likeController.getLikeStatus);

/**
 * @swagger
 * /like:
 *   post:
 *     summary: 좋아요 토글
 *     description: 로그인한 유저가 번역물에 좋아요를 누르거나(생성) 취소합니다(삭제). accessToken 쿠키 인증이 필요합니다.
 *     tags: [Like]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LikeToggleRequest"
 *     responses:
 *       200:
 *         description: 토글 성공 (좋아요 등록 또는 취소)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LikeToggleResponse"
 *       400:
 *         description: translationId 누락
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
likeRouter.post("/", authenticate, likeController.toggleLike);

export default likeRouter;
