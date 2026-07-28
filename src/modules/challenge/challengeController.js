import challengeService from "./challengeService.js";

const challengeController = {
  async getChallenges(req, res) {
    const result = await challengeService.getChallenges(req.validatedData);
    return res.status(200).json(result);
  },

  async getApplications(req, res) {
    const result = await challengeService.getApplications(req.validatedData);
    return res.status(200).json(result);
  },

  async approveApplication(req, res) {
    const challenge = await challengeService.approveApplication({
      challengeId: req.params.challengeId,
      adminId: req.user.id,
    });
    return res.status(200).json(challenge);
  },

  async rejectApplication(req, res) {
    const challenge = await challengeService.rejectApplication({
      challengeId: req.params.challengeId,
      reason: req.validatedData.reason,
    });
    return res.status(200).json(challenge);
  },

  async getChallengeDetail(req, res) {
    const result = await challengeService.getChallengeDetail(req.params.challengeId);
    return res.status(200).json(result);
  },

  async getParticipants(req, res) {
    const result = await challengeService.getParticipants({
      challengeId: req.params.challengeId,
      ...req.validatedData,
      currentUserId: req.user.id,
    });
    return res.status(200).json(result);
  },

  async getApplicationDetail(req, res) {
    const challenge = await challengeService.getApplicationDetail(req.params.challengeId);
    return res.status(200).json(challenge);
  },

  async updateChallenge(req, res) {
    const challenge = await challengeService.updateChallenge({
      challengeId: req.params.challengeId,
      data: req.validatedData,
    });
    return res.status(200).json(challenge);
  },
};

export default challengeController;
