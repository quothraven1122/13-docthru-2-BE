import { reviewRepository } from "./reviewRepository.js";
import { translationRepository } from "../translation/translationRepository.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "#src/common/utils/errors.js";

export const reviewService = {
  //댓글 전체목록
  async getReviews(translationId, cursorId, take) {
    if (!translationId) {
      throw new BadRequestError("translationId가 필요합니다.");
    }
    return reviewRepository.getReviews(translationId, cursorId, take);
  },
  //단건조회
  async getReviewById(reviewId) {
    if (!reviewId) {
      throw new BadRequestError("reviewId가 필요합니다.");
    }
    const review = await reviewRepository.getReview(reviewId);
    if (!review) {
      throw new NotFoundError("리뷰를 찾을 수 없습니다.");
    }
    return review;
  },
  //댓글 생성
  async createReview(userId, translationId, content) {
    if (!translationId) {
      throw new BadRequestError("translationId가 필요합니다.");
    }

    const existTranslation = await translationRepository.findByTranslationId(translationId);
    if (!existTranslation) {
      throw new NotFoundError("번역물을 찾을 수 없습니다.");
    }

    return reviewRepository.createReview({ content, reviewerId: userId, translationId });
  },
  //댓글업데이트
  async updateReview(userId, reviewId, content) {
    const review = await reviewRepository.getReview(reviewId);
    if (!review) {
      throw new NotFoundError("리뷰를 찾을 수 없습니다.");
    }
    if (review.reviewerId !== userId) {
      throw new ForbiddenError("본인이 작성한 리뷰만 수정할 수 있습니다.");
    }
    return reviewRepository.updateReview(reviewId, content);
  },
  //댓글삭제
  async deleteReview(userId, role, reviewId, deletionReason) {
    const review = await reviewRepository.getReview(reviewId);
    if (!review) {
      throw new NotFoundError("리뷰를 찾을 수 없습니다.");
    }
    const isOwner = review.reviewerId === userId;
    const isAdmin = role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("본인이 작성한 리뷰만 삭제할 수 있습니다.");
    }

    const reason = isAdmin ? deletionReason || "관리자가 삭제하였습니다." : "회원이 삭제하였습니다.";

    return reviewRepository.deleteReview(userId, reviewId, reason);
  },
};
