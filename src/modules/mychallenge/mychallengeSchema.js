import { z } from "zod";

export const myChallengesSchema = z.object({
  cursorId: z.string().uuid().optional(),
  pageSize: z.coerce.number().int().positive().default(10),
  keyword: z.string().trim().optional(),
  progress: z.enum(["PARTICIPATING", "COMPLETED"]).optional(),
});

export const myApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  keyword: z.string().trim().optional(),
  status: z.enum(["WAITING", "APPROVED", "REJECTED"]).optional(),
  sort: z.enum(["createdAsc", "createdDesc", "deadlineAsc", "deadlineDesc"]).default("createdDesc"),
});

export const updateMyApplicationSchema = z.object({
  title: z.string().trim().min(1).optional(),
  link: z.string().url("올바른 URL 형식이 아닙니다.").optional(),
  field: z.enum(["NEXTJS", "API", "CAREER", "MODERNJS", "WEB"]).optional(),
  docType: z.enum(["OFFICIAL", "BLOG"]).optional(),
  content: z.string().trim().min(1).optional(),
  headcount: z.coerce.number().int().positive().optional(),
  deadline: z.coerce.date().optional(),
});

export const challengeIdSchema = z.object({
  id: z.string().uuid("올바른 챌린지 id가아닙니다."),
});
