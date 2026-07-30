import prisma from "#src/common/configs/prisma.js";
import { translationRepository } from "./translationRepository.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "#src/common/utils/errors.js";

export const translationService = {
  // 번역물 단건 조회 (없으면 404)
  async getTranslationById(translationId) {
    if (!translationId) {
      throw new BadRequestError("translationId가 필요합니다.");
    }
    const translation = await translationRepository.findByTranslationId(translationId);
    if (!translation) {
      throw new NotFoundError("번역물을 찾을 수 없습니다.");
    }
    return translation;
  },

  async createTranslation(userId, challengeId) {
    // 참가 정보가 없으면 새로 생성, 있으면 기존 정보 사용
    const participation = await prisma.participation.upsert({
      where: {
        participatorId_challengeId: { participatorId: userId, challengeId },
      },
      update: {},
      create: { participatorId: userId, challengeId },
    });

    const existing = await translationRepository.findByParticipationId(participation.id);
    if (existing) {
      return existing;
    }
    return translationRepository.createTranslation(participation.id);
  },
  // 번역물 내용 수정 (본인 작성 건만 허용)
  async updateTranslation(userId, translationId, content) {
    const translation = await translationRepository.findByTranslationId(translationId);
    if (!translation) {
      throw new NotFoundError("번역물을 찾을 수 없습니다.");
    }
    if (translation.participation.participatorId !== userId) {
      throw new ForbiddenError("본인이 작성한 번역물만 수정할 수 있습니다.");
    }
    return translationRepository.updateTranslation(translationId, content);
  },

  // 번역물 삭제 (본인 또는 관리자만 허용, 삭제 사유는 회원/관리자 다르게 처리)
  async deleteTranslation(userId, role, translationId, deletionReason) {
    const translation = await translationRepository.findByTranslationId(translationId);
    if (!translation) {
      throw new NotFoundError("번역물을 찾을 수 없습니다.");
    }
    const isOwner = translation.participation.participatorId === userId;
    const isAdmin = role === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("본인이 작성한 번역물만 삭제할 수 있습니다.");
    }
    const reason = isAdmin ? deletionReason || "관리자가 삭제하였습니다." : "회원이 삭제하였습니다.";
    return translationRepository.deleteTranslation(translationId, userId, reason);
  },
};
