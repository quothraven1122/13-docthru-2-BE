import { z } from "zod";

export const reviewSchema = z.object({
  translationId: z.string().min(1, "translationId가 필요합니다."),
  content: z.string("댓글을 입력해주세요").min(1),
});

export const updateReviewSchema = z.object({
  content: z.string("댓글을 입력해주세요").min(1),
});
