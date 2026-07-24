import { likeRepository } from "./likeRepository.js";
import { BadRequestError } from "#src/common/utils/errors.js";

export const likeService = {
  async toggleLike(likerId, translationId) {
    if (!translationId) {
      throw new BadRequestError("translationId가 필요합니다.");
    }
    // TODO: translationId 검증로직 추가 해야함

    const existing = await likeRepository.findById(likerId, translationId);
    if (existing) {
      await likeRepository.deleteLike(likerId, translationId);
      return { liked: false };
    }

    const like = await likeRepository.createLike(likerId, translationId);
    return { liked: true, like };
  },

  async getLikeCount(translationId) {
    if (!translationId) {
      throw new BadRequestError("translationId가 필요합니다.");
    }

    // TODO: translationId 검증로직 추가? 대체? 해야함

    const count = await likeRepository.countLikes(translationId);
    return { count };
  },
};
