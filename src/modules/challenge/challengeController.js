import challengeService from "./challengeService.js";
import { asyncHandler } from "#src/common/utils/asyncHandler.js";

const challengeController = {
  getApplications: asyncHandler(async (req, res) => {
    const result = await challengeService.getApplications(req.validatedData);
    return res.status(200).json(result);
  }),
};

export default challengeController;
