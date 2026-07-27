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

  async getChallengeDetail(challengeId) {
    const challenge = await challengeRepository.findDetailById(challengeId);

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundError("챌린지를 찾을 수 없습니다.");
    }

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.content,
      link: challenge.link,
      category: challenge.field,
      docType: challenge.docType,
      deadlineDate: challenge.deadline,
      member: challenge._count.participations,
      maxMember: challenge.headcount,
      authorName: challenge.creator.nickname,
    };
  },

  async getParticipants({ challengeId, page, pageSize, currentUserId }) {
    const raw = await challengeRepository.findParticipantsRaw(challengeId);

    const withLikeCount = raw.map((p) => {
      const translations = p.translation; // 참여자당 여러 개일 수 있음
      const allLikes = translations.flatMap((t) => t.likes);

      const likeCount = allLikes.length;
      const liked = allLikes.some((l) => l.likerId === currentUserId);
      const latestTranslationId = translations[0]?.id ?? null; // orderBy desc라 [0]이 최신

      return {
        id: p.participator.id,
        name: p.participator.nickname,
        role: p.participator.grade === "EXPERT" ? "전문가" : "일반",
        likeCount,
        liked,
        translationId: latestTranslationId,
      };
    });

    withLikeCount.sort((a, b) => b.likeCount - a.likeCount);
    const ranked = withLikeCount.map((item, idx) => ({ ...item, rank: idx + 1 }));

    const totalCount = ranked.length;
    const totalPageCount = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const list = ranked.slice(start, start + pageSize);

    return { list, totalPageCount };
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
