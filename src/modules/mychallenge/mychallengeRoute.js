import express from "express";
import { mychallengeController } from "./mychallengeController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";
import { validate } from "#src/common/middlewares/validate.js";
import {
  challengeIdSchema,
  myApplicationsSchema,
  myChallengesSchema,
  updateMyApplicationSchema,
} from "./mychallengeSchema.js";

const router = express.Router();

/**
 * @swagger
 * /mychallenges:
 *   get:
 *     summary: 내가 참여한 챌린지 목록 조회
 *     description: 로그인한 유저가 참여중인 챌린지 목록을 조회합니다. 데드라인 기준 참여중/완료 필터, 제목 검색
 *     tags: [MyChallenge]
 *     parameters:
 *       - in: query
 *         name: cursorId
 *         description: 다음 페이지 조회를 위한 커서 (마지막으로 받은 participation id)
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, default: 10 }
 *       - in: query
 *         name: keyword
 *         description: 챌린지 제목 검색어
 *         schema: { type: string }
 *       - in: query
 *         name: progress
 *         description: 참여중 / 완료 필터 (데드라인 기준)
 *         schema: { type: string, enum: [PARTICIPATING, COMPLETED] }
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       participatorId: { type: string, format: uuid }
 *                       challengeId: { type: string, format: uuid }
 *                       createdAt: { type: string, format: date-time }
 *                       challenge:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           title: { type: string, example: "Next.js - App Router: Routing Fundamentals" }
 *                           field: { type: string, enum: [NEXTJS, API, CAREER, MODERNJS, WEB] }
 *                           docType: { type: string, enum: [OFFICIAL, BLOG] }
 *                           headcount: { type: integer, example: 10 }
 *                           deadline: { type: string, format: date-time }
 *                           status: { type: string, enum: [WAITING, APPROVED, REJECTED] }
 *                 nextCursorId: { type: string, format: uuid, nullable: true }
 *       400:
 *         description: 쿼리 파라미터 검증 실패
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 */
router.get("/", authenticate, validate(myChallengesSchema, "query"), mychallengeController.getMyChallenges);

// 주의: 챌린지 상세/수정/삭제(/applications/:id)는 /applications보다 뒤에 등록할 것 (경로 매칭 순서)
/**
 * @swagger
 * /mychallenges/applications:
 *   get:
 *     summary: 내가 신청(생성 요청)한 챌린지 목록 조회
 *     description: 로그인한 유저가 생성 신청한 챌린지 목록을 조회합니다. 제목 검색, 승인 상태 필터, 정렬, 페이지네이션을 지원합니다.
 *     tags: [MyChallenge]
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
 *         description: 승인 상태 필터
 *         schema: { type: string, enum: [WAITING, APPROVED, REJECTED] }
 *       - in: query
 *         name: sort
 *         description: 정렬 기준 (생성 시간·마감 기한)
 *         schema: { type: string, enum: [createdAsc, createdDesc, deadlineAsc, deadlineDesc], default: createdDesc }
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 myApplications:
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
 *                 totalPages: { type: integer, example: 5 }
 *       400:
 *         description: 쿼리 파라미터 검증 실패
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 */
router.get(
  "/applications",
  authenticate,
  validate(myApplicationsSchema, "query"),
  mychallengeController.getMyApplications,
);

/**
 * @swagger
 * /mychallenges/applications/{id}:
 *   get:
 *     summary: 신청한 챌린지 상세 조회
 *     description: 로그인한 유저 본인이 신청한 챌린지의 상세 정보를 조회합니다.
 *     tags: [MyChallenge]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 title: { type: string, example: "Next.js - App Router: Routing Fundamentals" }
 *                 link: { type: string, format: uri }
 *                 content: { type: string }
 *                 field: { type: string, enum: [NEXTJS, API, CAREER, MODERNJS, WEB] }
 *                 docType: { type: string, enum: [OFFICIAL, BLOG] }
 *                 headcount: { type: integer, example: 10 }
 *                 deadline: { type: string, format: date-time }
 *                 status: { type: string, enum: [WAITING, APPROVED, REJECTED] }
 *                 createdAt: { type: string, format: date-time }
 *       400:
 *         description: id 형식 오류 (uuid 아님)
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 조회할 권한이 없음
 *       404:
 *         description: 신청한 챌린지를 찾을 수 없음
 */
router.get(
  "/applications/:id",
  authenticate,
  validate(challengeIdSchema, "params"),
  mychallengeController.getMyAppliedChallenge,
);

/**
 * @swagger
 * /mychallenges/applications/{id}:
 *   patch:
 *     summary: 신청한 챌린지 수정
 *     description: 승인대기 상태인, 본인이 신청한 챌린지의 정보를 수정합니다. 승인/거절 처리된 챌린지는 수정할 수 없습니다.
 *     tags: [MyChallenge]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Next.js - App Router: Routing Fundamentals" }
 *               link: { type: string, format: uri, example: "https://nextjs.org/docs/app/routing" }
 *               field: { type: string, enum: [NEXTJS, API, CAREER, MODERNJS, WEB] }
 *               docType: { type: string, enum: [OFFICIAL, BLOG] }
 *               content: { type: string, example: "챌린지 상세 설명입니다." }
 *               headcount: { type: integer, example: 10 }
 *               deadline: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: 수정 성공 (변경된 챌린지 반환)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 title: { type: string }
 *                 link: { type: string, format: uri }
 *                 content: { type: string }
 *                 field: { type: string, enum: [NEXTJS, API, CAREER, MODERNJS, WEB] }
 *                 docType: { type: string, enum: [OFFICIAL, BLOG] }
 *                 headcount: { type: integer }
 *                 deadline: { type: string, format: date-time }
 *                 status: { type: string, enum: [WAITING, APPROVED, REJECTED] }
 *                 updatedAt: { type: string, format: date-time }
 *       400:
 *         description: 요청 형식 오류 또는 승인 대기(WAITING) 상태가 아니어서 수정 불가
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 수정할 권한이 없음
 *       404:
 *         description: 수정할 신청 내역을 찾을 수 없음
 */
router.patch(
  "/applications/:id",
  authenticate,
  validate(challengeIdSchema, "params"),
  validate(updateMyApplicationSchema),
  mychallengeController.updateMyApplication,
);

/**
 * @swagger
 * /mychallenges/applications/{id}:
 *   delete:
 *     summary: 신청한 챌린지 취소
 *     description: 승인대기 상태인, 본인이 신청한 챌린지를 취소합니다.
 *     tags: [MyChallenge]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "신청이 취소되었습니다." }
 *       400:
 *         description: id 형식 오류 또는 승인 대기 상태가 아니어서 취소 불가
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 삭제할 권한이 없음
 *       404:
 *         description: 취소할 신청 내역을 찾을 수 없음
 */
router.delete(
  "/applications/:id",
  authenticate,
  validate(challengeIdSchema, "params"),
  mychallengeController.cancelApplication,
);

export default router;
