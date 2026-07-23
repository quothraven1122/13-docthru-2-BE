import express from "express";
import challengeController from "./challengeController.js";
import challengeSchema from "./challengeSchema.js";
import { validate } from "#src/common/middlewares/validate.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";
import { authorizeAdmin } from "#src/common/middlewares/authorizeAdmin.js";

const challengeRouter = express.Router();

/**
 * @swagger
 * /challenges/applications:
 *   get:
 *     summary: 신청한 신규 챌린지 목록 조회 (어드민)
 *     description: 어드민이 유저가 신청한 신규 챌린지 목록을 조회합니다. 제목 검색, 상태 필터, 정렬, 페이지네이션을 지원합니다.
 *     tags: [Challenge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *       - in: query
 *         name: keyword
 *         description: 챌린지 제목 검색어
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         description: 신청 상태 필터
 *         schema: { type: string, enum: [WAITING, APPROVED, REJECTED] }
 *       - in: query
 *         name: sort
 *         description: 정렬 기준 (신청 시간·마감 기한)
 *         schema: { type: string, enum: [appliedAtAsc, appliedAtDesc, deadlineAsc, deadlineDesc], default: appliedAtDesc }
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       title: { type: string, example: "Next.js - App Router: Routing Fundamentals" }
 *                       field: { type: string, enum: [NEXTJS, API, CAREER, MODERNJS, WEB] }
 *                       docType: { type: string, enum: [OFFICIAL, BLOG] }
 *                       headcount: { type: integer, example: 10 }
 *                       deadline: { type: string, format: date-time }
 *                       status: { type: string, enum: [WAITING, APPROVED, REJECTED] }
 *                       createdAt: { type: string, format: date-time }
 *                       deletedAt: { type: string, format: date-time, nullable: true }
 *                 totalCount: { type: integer, example: 42}
 *       400:
 *         description: 쿼리 파라미터 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: 어드민 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
// 주의: 챌린지 상세(GET /:challengeId) 추가 시 /applications보다 뒤에 등록할 것 (경로 매칭 순서)
challengeRouter.get(
  "/applications",
  authenticate,
  authorizeAdmin,
  validate(challengeSchema.getApplicationsSchema, "query"),
  challengeController.getApplications,
);

export default challengeRouter;
