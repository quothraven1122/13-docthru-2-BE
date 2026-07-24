import challengeService from "./challengeService.js";

const challengeController = {
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
};

export default challengeController;
