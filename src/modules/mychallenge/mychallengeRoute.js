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
 *     description: 로그인한 유저가 참여중인 챌린지 목록을 조회합니다. 데드라인 기준 참여중/완료 필터, 제목 검색, 커서 기반 무한스크롤을 지원합니다.
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
 *                       id: { type: string, format: uuid, description: "participation id" }
 *                       participatorId: { type: string, format: uuid }
 *                       challengeId: { type: string, format: uuid }
 *                       createdAt: { type: string, format: date-time }
 *                       translation:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id: { type: string, format: uuid }
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
 *                           _count:
 *                             type: object
 *                             properties:
 *                               participations: { type: integer, example: 3, description: "현재 참여자 수" }
 *                 nextCursorId: { type: string, format: uuid, nullable: true }
 *       400:
 *         description: 쿼리 파라미터 검증 실패
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 */
router.get("/", authenticate, validate(myChallengesSchema, "query"), mychallengeController.getMyChallenges);

/**
 * @swagger
 * /mychallenges/applications:
 *   get:
 *     summary: 내가 신청(생성 요청)한 챌린지 목록 조회
 *     description: >
 *       로그인한 유저가 생성 신청한 챌린지 목록을 조회합니다. 제목 검색, 정렬을 지원합니다.
 *       sort 값으로 시간순 정렬(createdAsc/createdDesc/deadlineAsc/deadlineDesc) 또는
 *       상태 우선 정렬(WAITING/APPROVED/REJECTED)을 선택할 수 있습니다.
 *       WAITING·REJECTED는 삭제되지 않은 항목을 해당 상태 기준으로 앞에 배치하고,
 *       APPROVED는 승인된 항목을 최우선으로 배치합니다.
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
 *         name: sort
 *         description: 정렬 기준 (시간순 또는 상태 우선순)
 *         schema:
 *           type: string
 *           enum: [WAITING, APPROVED, REJECTED, createdAsc, createdDesc, deadlineAsc, deadlineDesc]
 *           default: createdDesc
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
 *                       approvedAt: { type: string, format: date-time, nullable: true }
 *                       rejectReason: { type: string, nullable: true }
 *                       deletedAt: { type: string, format: date-time, nullable: true }
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
 *     description: 로그인한 유저 본인이 신청한 챌린지의 상세 정보를 조회합니다. 승인/거절 처리자, 삭제 처리자 정보를 함께 반환합니다.
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
 *                 approvedAt: { type: string, format: date-time, nullable: true }
 *                 rejectReason: { type: string, nullable: true, example: "원문 링크가 유효하지 않습니다." }
 *                 deletedAt: { type: string, format: date-time, nullable: true }
 *                 deletionReason: { type: string, nullable: true, example: "테스트용 취소" }
 *                 approver:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     nickname: { type: string, example: "닉네임" }
 *                 deleter:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     nickname: { type: string, example: "닉네임" }
 *       400:
 *         description: id 형식 오류 (uuid 아님)
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 본인의 신청이 아니어서 조회 권한이 없음
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
 *     description: 승인대기(WAITING) 상태이고 삭제되지 않은, 본인이 신청한 챌린지의 정보를 수정합니다. 모든 필드는 선택 입력이며, 보낸 필드만 갱신됩니다.
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
 *               deadline: { type: string, format: date-time, description: "현재 시각 이후여야 함" }
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
 *         description: 요청 형식 오류, 또는 승인대기(WAITING) 상태가 아니거나 이미 삭제되어 수정 불가
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 수정 권한이 없음 (본인의 신청이 아님)
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
 *     description: 승인대기(WAITING) 상태이고 삭제되지 않은, 본인이 신청한 챌린지를 취소(삭제)합니다.
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
 *         description: id 형식 오류, 또는 승인대기(WAITING) 상태가 아니거나 이미 삭제되어 취소 불가
 *       401:
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       403:
 *         description: 취소 권한이 없음 (본인의 신청이 아님)
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
