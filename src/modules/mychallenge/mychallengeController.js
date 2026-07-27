import { mychallengeService } from "./mychallengeService.js";

export const mychallengeController = {
  //참여한 챌린지 목록
  getMyChallenges: async (req, res) => {
    const result = await mychallengeService.myChallenges(req.user.id, req.validatedData);
    return res.status(200).json(result);
  },
  //신청한 챌린지 목록
  getMyApplications: async (req, res) => {
    const result = await mychallengeService.myApplications(req.user.id, req.validatedData);
    return res.status(200).json(result);
  },
  //신청한 챌린지 상세 조회
  getMyAppliedChallenge: async (req, res) => {
    const { id } = req.validatedData;
    const result = await mychallengeService.myAppliedChallenge(id);
    return res.status(200).json(result);
  },
  updateMyApplication: async (req, res) => {
    const { id } = req.params;
    const result = await mychallengeService.updateMyApplication(id, req.user.id, req.validatedData);
    return res.status(200).json(result);
  },
  //챌린지 신청 취소.
  cancelApplication: async (req, res) => {
    const { id } = req.validatedData;
    const result = await mychallengeService.cancelApplication(req.user.id, id);
    return res.status(200).json({ message: "신청이 취소되었습니다." });
  },
};
