import express from "express";
import { translationController } from "./translationController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";
import { validate } from "#src/common/middlewares/validate.js";
import { createTranslationSchema, updateTranslationSchema } from "./translationSchema.js";

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

// 번역물 삭제 (소프트 삭제)
translationRouter.delete("/:translationId", authenticate, translationController.deleteTranslation);

export default translationRouter;
