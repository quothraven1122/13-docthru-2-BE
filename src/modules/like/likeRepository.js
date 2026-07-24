import prisma from "#src/common/configs/prisma.js";

export const likeRepository = {
  //조회
  findById(likerId, translationId) {
    return prisma.like.findUnique({
      where: {
        likerId_translationId: { likerId, translationId },
      },
    });
  },
  //생성
  createLike(likerId, translationId) {
    return prisma.like.create({
      data: { likerId, translationId },
    });
  },
  //삭제
  deleteLike(likerId, translationId) {
    return prisma.like.delete({
      where: {
        likerId_translationId: { likerId, translationId },
      },
    });
  },
  //좋아요 개수
  countLikes(translationId) {
    return prisma.like.count({
      where: { translationId },
    });
  },
};
