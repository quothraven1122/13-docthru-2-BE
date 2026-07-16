import { z } from "zod";

const OPTIONAL_SIZE = {
  nickname: { min: 2, max: 10 },
  password: { min: 9 },
};

export const registerSchema = z
  .object({
    email: z.email("올바른 이메일 형식이 아닙니다."),
    nickname: z
      .string()
      .min(OPTIONAL_SIZE.nickname.min, `닉네임은 ${OPTIONAL_SIZE.nickname.min}자 이상이어야 합니다.`)
      .max(OPTIONAL_SIZE.nickname.max, `닉네임은 ${OPTIONAL_SIZE.nickname.max}자 이하여야 합니다.`),
    password: z
      .string()
      .min(OPTIONAL_SIZE.password.min, `비밀번호는 ${OPTIONAL_SIZE.password.min}자 이상이어야 합니다.`),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });
