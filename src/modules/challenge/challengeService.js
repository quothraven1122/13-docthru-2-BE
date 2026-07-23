import challengeRepository from "./challengeRepository.js";
import { BadRequestError, NotFoundError } from "#src/common/utils/errors.js";

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
  async approveApplication({ challengeId, adminId }) {
    await validateWaitingApplication(challengeId);

    return challengeRepository.update(challengeId, {
      status: "APPROVED",
      approvedAt: new Date(),
      approverId: adminId,
    });
  },
  async rejectApplication({ challengeId, reason }) {
    await validateWaitingApplication(challengeId);

    return challengeRepository.update(challengeId, {
      status: "REJECTED",
      rejectReason: reason,
    });
  },
};

async function validateWaitingApplication(challengeId) {
  const challenge = await challengeRepository.findById(challengeId);

  if (!challenge || challenge.deletedAt) {
    throw new NotFoundError("신청 내역을 찾을 수 없습니다.");
  }
  if (challenge.status !== "WAITING") {
    throw new BadRequestError("이미 승인 또는 거절 처리된 신청입니다.");
  }
}

export default challengeService;
