import express from "express";
import { translationController } from "./translationController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";
import { validate } from "#src/common/middlewares/validate.js";
import { createTranslationSchema, updateTranslationSchema } from "./translationSchema.js";
import { likeController } from "../like/likeController.js";

const translationRouter = express.Router();

// 챌린지 상세 페이지에서 참가자 목록 + 번역물 가져올 떄 이거쓰면 안됨

// 번역물 단건 조회 (작업물보기, 인증 불필요)
translationRouter.get("/:translationId", translationController.getTranslationById);

// 번역물 생성 (작업 도전하기)
// 도전하기 클릭시 번역물을 찾는 로직이 내부에서 일어나고 번역물이 없다면 생성,있으면 있는 데이터 반환해줍니다.
translationRouter.post("/", authenticate, validate(createTranslationSchema), translationController.createTranslation);

// 번역물 수정 (작업물 내용 작성/저장)
translationRouter.patch(
  "/:translationId",
  authenticate,
  validate(updateTranslationSchema),
  translationController.updateTranslation,
);

/**
 * @swagger
 * /translation/{translationId}/like/count:
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
translationRouter.get("/:translationId/like/count", likeController.getLikeCount);

/**
 * @swagger
 * /translation/{translationId}/like/status:
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
translationRouter.get("/:translationId/like/status", authenticate, likeController.getLikeStatus);

/**
 * @swagger
 * /translation/{translationId}/like:
 *   post:
 *     summary: 좋아요 토글
 *     description: 로그인한 유저가 번역물에 좋아요를 누르거나(생성) 취소합니다(삭제). accessToken 쿠키 인증이 필요합니다.
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: translationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 좋아요를 토글할 번역물 ID
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
translationRouter.post("/:translationId/like", authenticate, likeController.toggleLike);

// 번역물 삭제 (소프트 삭제)
translationRouter.delete("/:translationId", authenticate, translationController.deleteTranslation);

export default translationRouter;
