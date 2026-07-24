import { asyncHandler } from "#src/common/utils/asyncHandler.js";
import { likeService } from "./likeService.js";

export const likeController = {
  toggleLike: asyncHandler(async (req, res) => {
    const likerId = req.user.id;
    const { translationId } = req.body;
    const data = await likeService.toggleLike(likerId, translationId);
    return res.status(200).json(data);
  }),

  getLikeCount: asyncHandler(async (req, res) => {
    const { translationId } = req.query;
    const data = await likeService.getLikeCount(translationId);
    return res.status(200).json(data);
  }),
};
