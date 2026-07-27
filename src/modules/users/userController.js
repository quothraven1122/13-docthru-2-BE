import { asyncHandler } from "#src/common/utils/asyncHandler.js";
import { userService } from "./userService.js";

export const userController = {
  getMe: asyncHandler(async (req, res) => {
    const data = await userService.getMe(req.user.id);
    return res.status(200).json(data);
  }),
};
