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

/**
 * @swagger
 * /challenges/{challengeId}/approve:
 *   patch:
 *     summary: 신청한 신규 챌린지 승인 (어드민)
 *     description: WAITING 상태의 챌린지 신청을 승인합니다. 승인 시 approvedAt과 approverId가 기록되고 챌린지 보기 목록에 노출됩니다.
 *     tags: [Challenge]
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: 승인 성공 (변경된 챌린지 반환)
 *       400:
 *         description: 이미 처리된 신청이거나 ID 형식 오류
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 어드민 권한 없음
 *       404:
 *         description: 신청 내역을 찾을 수 없음
 */
challengeRouter.patch(
  "/:challengeId/approve",
  authenticate,
  authorizeAdmin,
  validate(challengeSchema.challengeIdParamsSchema, "params"),
  challengeController.approveApplication,
);

/**
 * @swagger
 * /challenges/{challengeId}/reject:
 *   patch:
 *     summary: 신청한 신규 챌린지 거절 (어드민)
 *     description: WAITING 상태의 챌린지 신청을 거절 사유와 함께 거절합니다.
 *     tags: [Challenge]
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string, example: "원문 링크가 유효하지 않습니다." }
 *     responses:
 *       200:
 *         description: 거절 성공 (변경된 챌린지 반환)
 *       400:
 *         description: 이미 처리된 신청이거나 사유 누락
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 어드민 권한 없음
 *       404:
 *         description: 신청 내역을 찾을 수 없음
 */
// validate를 params→body 순으로 두 번 거치면 req.validatedData는 마지막(body) 기준 — challengeId는 req.params에서 읽음
challengeRouter.patch(
  "/:challengeId/reject",
  authenticate,
  authorizeAdmin,
  validate(challengeSchema.challengeIdParamsSchema, "params"),
  validate(challengeSchema.rejectApplicationSchema),
  challengeController.rejectApplication,
);

export default challengeRouter;
