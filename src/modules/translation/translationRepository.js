import prisma from "#src/common/configs/prisma.js";

export const translationRepository = {
  //작업물보기 눌렀을때 사용하는 코드 (참가정보 포함 - 소유권 확인용)
  async findByTranslationId(translationId) {
    const translationData = await prisma.translation.findFirst({
      where: {
        id: translationId,
        deletedAt: null,
      },
      include: {
        participation: {
          include: {
            challenge: {
              select: {
                title: true,
                link: true,
                field: true,
                docType: true,
              },
            },
            participator: {
              select: { nickname: true },
            },
          },
        },
      },
    });
    if (!translationData) {
      return null;
    }

    const { challenge, participator, ...participation } = translationData.participation;

    return {
      ...translationData,
      participation,
      ...challenge,
      ...participator,
    };
  },

  //작업 도전하기 눌렀을때 작업물이 있는지 확인하는 코드
  findByParticipationId(participationId) {
    return prisma.translation.findFirst({
      where: {
        participationId,
        deletedAt: null,
      },
    });
  },
  //작업 도전하기 눌렀을때 만들어지고 난 이후에 다시 조회진행후 작업물 진행하는 방향으로 진행
  createTranslation(participationId) {
    return prisma.translation.create({ data: { participationId } });
  },
  //실질적인 작업물 생성하기(나중에 변경될지도?)
  updateTranslation(translationId, content) {
    return prisma.translation.update({ where: { id: translationId }, data: { content } });
  },
  //소프트 딜리트 기능
  deleteTranslation(translationId, deleterId, deletionReason) {
    return prisma.translation.update({
      where: { id: translationId },
      data: { deletedAt: new Date(), deleterId, deletionReason },
    });
  },
};
