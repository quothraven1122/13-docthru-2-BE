import prisma from "#src/common/configs/prisma.js";

const challengeRepository = {
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
};

export default challengeRepository;
