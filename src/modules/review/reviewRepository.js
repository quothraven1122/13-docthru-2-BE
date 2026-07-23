import prisma from "#src/common/configs/prisma.js";

export const reviewRepository = {
  //번역물 리뷰 조회
  getReviews(translationId, cursorId, take = 10) {
    return prisma.review.findMany({
      take,
      where: {
        translationId,
        deletedAt: null,
      },
      ...(cursorId && {
        skip: 1,
        cursor: { id: cursorId },
      }),
      orderBy: { createdAt: "desc" },
    });
  },
  //단건조회
  getReview(reviewId) {
    return prisma.review.findFirst({
      where: {
        id: reviewId,
        deletedAt: null,
      },
    });
  },
  //생성
  createReview({ content, reviewerId, translationId }) {
    return prisma.review.create({
      data: { content, reviewerId, translationId },
    });
  },
  //수정
  updateReview(reviewId, content) {
    return prisma.review.update({
      where: { id: reviewId },
      data: { content: content },
    });
  },
  //삭제
  deleteReview(userId, reviewId, deletedReason) {
    return prisma.review.update({
      where: { id: reviewId },
      data: { deleterId: userId, deletedAt: new Date(), deletionReason: deletedReason },
    });
  },
};
