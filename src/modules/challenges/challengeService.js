import challengeRepository from "./challengeRepository.js";
import { BadRequestError, NotFoundError } from "#src/common/utils/errors.js";

const APPLICATION_ORDER_BY = {
  appliedAtAsc: { createdAt: "asc" },
  appliedAtDesc: { createdAt: "desc" },
  deadlineAsc: { deadline: "asc" },
  deadlineDesc: { deadline: "desc" },
};

const challengeService = {
  async createChallenge({ creatorId, data }) {
    return challengeRepository.create({ ...data, creatorId });
  },

  async getChallenges({ page, pageSize, keyword, field, docType, progress }) {
    const now = new Date();

    const where = {
      status: "APPROVED",
      deletedAt: null,
      ...(keyword && { title: { contains: keyword, mode: "insensitive" } }),
      ...(field && { field: { in: field } }),
      ...(docType && { docType }),
      ...(progress === "ONGOING" && { deadline: { gte: now } }),
      ...(progress === "CLOSED" && { deadline: { lt: now } }),
    };

    const [totalCount, challenges] = await Promise.all([
      challengeRepository.countChallenges(where),
      challengeRepository.findChallenges({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const list = challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      field: challenge.field,
      docType: challenge.docType,
      deadline: challenge.deadline,
      headcount: challenge.headcount,
      count: challenge._count.participations,
    }));

    return { list, totalCount };
  },

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

  async getChallengeDetail(challengeId) {
    const challenge = await challengeRepository.findDetailById(challengeId);

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundError("챌린지를 찾을 수 없습니다.");
    }

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.content, // DB 필드명: content → API 응답명: description
      link: challenge.link,
      category: challenge.field, // DB 필드명: field → API 응답명: category
      docType: challenge.docType,
      deadlineDate: challenge.deadline, // DB 필드명: deadline → API 응답명: deadlineDate
      member: challenge._count.participations,
      headcount: challenge.headcount,
      authorName: challenge.creator.nickname,
    };
  },

  async getParticipants({ challengeId, page, pageSize, currentUserId }) {
    const participations = await challengeRepository.findParticipantsRaw(challengeId);

    const withLikeCount = participations.map((participation) => {
      const translations = participation.translation;
      const likes = translations.flatMap((translation) => translation.likes);

      const likeCount = likes.length;
      const liked = likes.some((like) => like.likerId === currentUserId);
      const latestTranslationId = translations[0]?.id ?? null;

      return {
        id: participation.participator.id,
        name: participation.participator.nickname,
        role: participation.participator.grade,
        likeCount,
        liked,
        translationId: latestTranslationId,
      };
    });

    const ranked = [...withLikeCount]
      .sort((a, b) => b.likeCount - a.likeCount)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const totalCount = ranked.length;
    const totalPageCount = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const list = ranked.slice(start, start + pageSize);

    return { list, totalPageCount };
  },

  async getApplicationDetail(challengeId) {
    const challenge = await challengeRepository.findDetailById(challengeId);

    if (!challenge) {
      throw new NotFoundError("신청 내역을 찾을 수 없습니다.");
    }
    return challenge;
  },

  async updateChallenge({ challengeId, data }) {
    const challenge = await challengeRepository.findById(challengeId);

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundError("챌린지를 찾을 수 없습니다.");
    }

    return challengeRepository.update(challengeId, data);
  },

  async deleteChallenge({ challengeId, reason, adminId }) {
    const challenge = await challengeRepository.findById(challengeId);

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundError("챌린지를 찾을 수 없습니다.");
    }

    return challengeRepository.update(challengeId, {
      deletedAt: new Date(),
      deletionReason: reason,
      deleterId: adminId,
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
