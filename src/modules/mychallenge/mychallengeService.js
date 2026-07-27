import { BadRequestError, NotFoundError } from "#src/common/utils/errors.js";
import { mychallengeRepository } from "./mychallengeRepository.js";

const SORT_TYPE = {
  createdAsc: { createdAt: "asc" },
  createdDesc: { createdAt: "desc" },
  deadlineAsc: { deadline: "asc" },
  deadlineDesc: { deadline: "desc" },
};

export const mychallengeService = {
  myChallenges: async (userId, { pageSize, cursorId, keyword, progress }) => {
    //참여중, 완료된것(마감 끝남) 구분하기 위해서.
    const now = new Date();
    const progressFilter =
      progress === "PARTICIPATING" ? { gte: now } : progress === "COMPLETED" ? { lt: now } : undefined;
    const where = {
      participatorId: userId,
      challenge: {
        ...(keyword && { title: { contains: keyword, mode: "insensitive" } }),
        deadline: progressFilter,
      },
    };
    const participation = await mychallengeRepository.findMyChallenges({
      where,
      pageSize,
      cursorId,
    });

    const isNextPage = participation.length > pageSize; //다음 페이지에 데이터가 존재하는지 확인.
    let dataList = participation;
    let nextCursorId = null;

    if (isNextPage) {
      dataList = participation.slice(0, -1);
      nextCursorId = dataList[dataList.length - 1].id;
    }

    return { dataList, nextCursorId };
  },

  myApplications: async (userId, { pageSize, page, keyword, status, sort }) => {
    const where = {
      creatorId: userId,
      ...(keyword && { title: { contains: keyword, mode: "insensitive" } }),
      ...(status && { status: status }),
    };
    const orderBy = sort ? SORT_TYPE[sort] : SORT_TYPE.createdAsc;

    const myApplications = await mychallengeRepository.findMyApplications({ where, pageSize, page, orderBy });
    const count = await mychallengeRepository.myApplicationsCount({ where });

    const totalPages = Math.ceil(count / pageSize);

    return { myApplications, totalPages };
  },
  myAppliedChallenge: async (id) => {
    const challenge = await mychallengeRepository.findMyAppliedChallenge(id);
    if (!challenge) throw new NotFoundError("신청한 챌린지를 찾을 수 없습니다.");
    return challenge;
  },
  updateMyApplication: async (id, userId, { title, link, field, docType, content, headcount, deadline }) => {
    const challenge = await mychallengeRepository.findMyAppliedChallenge(id);
    if (!challenge) throw new NotFoundError("신청을 수정할 챌린지를 찾을 수 없습니다.");
    if (challenge.status !== "WAITING") throw new BadRequestError("챌린지를 수정할 수 없습니다.");

    const where = { id, creatorId: userId };
    const data = { title, link, field, docType, content, headcount, deadline };

    return await mychallengeRepository.updateMyApplication({ where, data });
  },
  cancelApplication: async (userId, id) => {
    const challenge = await mychallengeRepository.findMyAppliedChallenge(id);
    if (!challenge) throw new NotFoundError("신청을 취소할 챌린지를 찾을 수 없습니다.");
    if (challenge.status !== "WAITING") throw new BadRequestError("챌린지 신청을 취소할 수 없습니다.");

    const where = { id, creatorId: userId };
    return await mychallengeRepository.deleteMyAppliedChallenge({ where });
  },
};
