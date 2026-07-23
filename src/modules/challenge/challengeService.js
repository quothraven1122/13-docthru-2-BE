import challengeRepository from "./challengeRepository.js";

const APPLICATION_ORDER_BY = {
  appliedAtAsc: { createdAt: "asc" },
  appliedAtDesc: { createdAt: "desc" },
  deadlineAsc: { deadline: "asc" },
  deadlineDesc: { deadline: "desc" },
};

const challengeService = {
  async getApplications({ page, pageSize, keyword, status, sort }) {
    const where = {
      ...(keyword && { title: { contains: keyword, mode: "insensitive" } }),
      ...(status && { status }),
    };

    const [totalCount, list] = await Promise.all([
      challengeRepository.countApplications(where),
      challengeRepository.findApplications({
        where,
        orderBy: APPLICATION_ORDER_BY[sort],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { list, totalCount };
  },
};

export default challengeService;
