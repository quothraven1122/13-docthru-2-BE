import prisma from "#src/common/configs/prisma.js";

export const mychallengeRepository = {
  findMyChallenges: async ({ where, pageSize, cursorId }) => {
    return await prisma.participation.findMany({
      where,
      include: {
        challenge: true,
      },
      take: pageSize + 1,
      ...(cursorId && {
        cursor: { id: cursorId },
        skip: 1,
      }),
    });
  },

  findMyApplications: async ({ where, pageSize, page, orderBy }) => {
    return await prisma.challenge.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },
  myApplicationsCount: async ({ where }) => {
    return await prisma.challenge.count({ where });
  },
  findMyAppliedChallenge: async (id) => {
    return await prisma.challenge.findUnique({
      where: { id },
      include: {
        approver: { select: { id: true, nickname: true } },
        deleter: { select: { id: true, nickname: true } },
      },
    });
  },
  updateMyApplication: async ({ where, data }) => {
    return await prisma.challenge.update({ where, data });
  },
  deleteMyAppliedChallenge: async ({ where }) => {
    return await prisma.challenge.delete({
      where,
    });
  },
};
