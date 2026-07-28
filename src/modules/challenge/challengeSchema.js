import { z } from "zod";

const APPLICATION_SORT = ["appliedAtAsc", "appliedAtDesc", "deadlineAsc", "deadlineDesc"];
const APPLICATION_STATUS = ["WAITING", "APPROVED", "REJECTED"];
const FIELD_VALUES = ["NEXTJS", "API", "CAREER", "MODERNJS", "WEB"];
const DOC_TYPE_VALUES = ["OFFICIAL", "BLOG"];
const CHALLENGE_PROGRESS = ["ONGOING", "CLOSED"];

const challengeSchema = {
  // 챌린지 목록 조회 (일반 유저용, APPROVED만 노출)
  getChallengesSchema: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
    keyword: z.string().trim().optional(),
    // 콤마로 구분된 문자열로 전달 (예: field=NEXTJS,WEB)
    field: z
      .string()
      .optional()
      .transform((value) => (value ? value.split(",") : undefined))
      .refine((values) => !values || values.every((value) => FIELD_VALUES.includes(value)), {
        message: "유효하지 않은 field 값입니다.",
      }),
    docType: z.enum(DOC_TYPE_VALUES).optional(),
    // 진행중(마감일 이전) / 마감(마감일 지남) 필터
    progress: z.enum(CHALLENGE_PROGRESS).optional(),
  }),

  getApplicationsSchema: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
    keyword: z.string().trim().optional(),
    status: z.enum(APPLICATION_STATUS).optional(),
    sort: z.enum(APPLICATION_SORT).default("appliedAtDesc"),
  }),

  challengeIdParamsSchema: z.object({
    challengeId: z.uuid("올바른 챌린지 ID 형식이 아닙니다."),
  }),

  rejectApplicationSchema: z.object({
    reason: z.string().trim().min(1, "거절 사유를 입력해 주세요."),
  }),

  getParticipantsSchema: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(5),
  }),

  updateChallengeSchema: z
    .object({
      title: z.string().trim().min(1, "제목을 입력해 주세요.").optional(),
      link: z.url("올바른 링크 형식이 아닙니다.").optional(),
      content: z.string().trim().min(1, "내용을 입력해 주세요.").optional(),
      field: z.enum(FIELD_VALUES).optional(),
      docType: z.enum(DOC_TYPE_VALUES).optional(),
      deadline: z.coerce.date().optional(),
      headcount: z.coerce.number().int().positive().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "수정할 항목을 하나 이상 입력해 주세요.",
    }),
};

export default challengeSchema;
