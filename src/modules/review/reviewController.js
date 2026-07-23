import { asyncHandler } from "#src/common/utils/asyncHandler.js";
import { reviewService } from "./reviewService.js";

export const reviewController = {
  getReviews: asyncHandler(async (req, res) => {
    const { translationId, cursor, take } = req.query;
    const data = await reviewService.getReviews(translationId, cursor, take ? Number(take) : undefined);
    return res.status(200).json(data);
  }),
  getReviewById: asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const data = await reviewService.getReviewById(reviewId);
    return res.status(200).json(data);
  }),
  createReview: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { translationId, content } = req.validatedData;
    const data = await reviewService.createReview(userId, translationId, content);
    return res.status(201).json(data);
  }),
  updateReview: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { content } = req.validatedData;
    const data = await reviewService.updateReview(userId, reviewId, content);
    return res.status(200).json(data);
  }),
  deleteReview: asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const { reviewId } = req.params;
    const { deletionReason } = req.body ?? {};
    const data = await reviewService.deleteReview(userId, role, reviewId, deletionReason);
    return res.status(200).json(data);
  }),
};
