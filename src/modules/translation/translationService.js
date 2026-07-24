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

  // 번역물 생성 (challengeId+userId로 참가정보 확인 후 생성, 이미 있으면 기존 데이터 반환)
  async createTranslation(userId, challengeId) {
    // TODO: participationRepository가 생기면 이 조회는 그쪽으로 옮기기
    const participation = await prisma.participation.findUnique({
      where: {
        participatorId_challengeId: { participatorId: userId, challengeId },
      },
    });

    if (!participation) {
      throw new NotFoundError("참가 정보를 찾을 수 없습니다.");
    }

    const existing = await translationRepository.findByParticipationId(participation.id);
    if (existing) {
      // 존재하면 여기에 있는 id 사용해서 접근하도록 요청 하면 됩니다.
      return existing;
    }
    //여기서 반환되는 ID(translation)값으로 요청하면됩니다.
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
