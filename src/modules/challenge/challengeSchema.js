import { z } from "zod";

const APPLICATION_SORT = ["appliedAtAsc", "appliedAtDesc", "deadlineAsc", "deadlineDesc"];
const APPLICATION_STATUS = ["WAITING", "APPROVED", "REJECTED"];

const challengeSchema = {
  getApplicationsSchema: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
    keyword: z.string().trim().optional(),
    status: z.enum(APPLICATION_STATUS).optional(),
    sort: z.enum(APPLICATION_SORT).default("appliedAtDesc"),
  }),
};

export default challengeSchema;
