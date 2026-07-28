import prisma from "#src/common/configs/prisma.js";

const challengeRepository = {
  countChallenges(where) {
    return prisma.challenge.count({ where });
  },

  findChallenges({ where, orderBy, skip, take }) {
    return prisma.challenge.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        title: true,
        field: true,
        docType: true,
        deadline: true,
        headcount: true,
        _count: {
          select: { participations: true },
        },
      },
    });
  },

  countApplications(where) {
    return prisma.challenge.count({ where });
  },

  findApplications({ where, orderBy, skip, take }) {
    return prisma.challenge.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        title: true,
        field: true,
        docType: true,
        headcount: true,
        deadline: true,
        status: true,
        createdAt: true,
        deletedAt: true,
      },
    });
  },
  findById(id) {
    return prisma.challenge.findUnique({ where: { id } });
  },
  update(id, data) {
    return prisma.challenge.update({ where: { id }, data });
  },

  findDetailById(id) {
    return prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        link: true,
        field: true,
        docType: true,
        deadline: true,
        headcount: true,
        status: true,
        approvedAt: true,
        rejectReason: true,
        createdAt: true,
        deletedAt: true,
        deletedAt: true,
        creator: {
          select: { nickname: true },
        },
        _count: {
          select: { participations: true },
        },
      },
    });
  },

  findParticipantsRaw(challengeId) {
    return prisma.participation.findMany({
      where: { challengeId },
      select: {
        id: true,
        participator: {
          select: { id: true, nickname: true, grade: true },
        },
        translation: {
          select: {
            id: true,
            createdAt: true,
            likes: {
              select: { likerId: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },
};

export default challengeRepository;
