import { asyncHandler } from "#src/common/utils/asyncHandler.js";
import { translationService } from "./translationService.js";

export const translationController = {
  // 번역물 단건 조회
  getTranslationById: asyncHandler(async (req, res) => {
    const { translationId } = req.params;
    const data = await translationService.getTranslationById(translationId);
    return res.status(200).json(data);
  }),

  // 번역물 생성 (작업 도전하기)
  createTranslation: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { challengeId } = req.validatedData;
    const data = await translationService.createTranslation(userId, challengeId);
    return res.status(201).json(data);
  }),

  // 번역물 내용 수정
  updateTranslation: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { translationId } = req.params;
    const { content } = req.validatedData;
    const data = await translationService.updateTranslation(userId, translationId, content);
    return res.status(200).json(data);
  }),

  // 번역물 삭제 (소프트 삭제)
  deleteTranslation: asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const { translationId } = req.params;
    const { deletionReason } = req.body ?? {};
    const data = await translationService.deleteTranslation(userId, role, translationId, deletionReason);
    return res.status(200).json(data);
  }),
};
