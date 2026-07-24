import express from "express";
import { reviewController } from "./reviewController.js";
import { authenticate } from "#src/common/middlewares/authenticate.js";
import { validate } from "#src/common/middlewares/validate.js";
import { reviewSchema, updateReviewSchema } from "./reviewSchema.js";

const reviewRouter = express.Router();

reviewRouter.get("/", reviewController.getReviews);

reviewRouter.get("/:reviewId", reviewController.getReviewById);

reviewRouter.post("/", authenticate, validate(reviewSchema), reviewController.createReview);

reviewRouter.patch("/:reviewId", authenticate, validate(updateReviewSchema), reviewController.updateReview);

reviewRouter.delete("/:reviewId", authenticate, reviewController.deleteReview);

export default reviewRouter;
