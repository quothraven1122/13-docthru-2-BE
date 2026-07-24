import { z } from "zod";

// 번역물 생성 시 검증 (작업 도전하기 - challengeId 필요)
export const createTranslationSchema = z.object({
  challengeId: z.string().min(1, "challengeId가 필요합니다."),
});

// 번역물 수정 시 검증 (실질적인 작업물 내용)
export const updateTranslationSchema = z.object({
  content: z.string("번역 내용을 입력해주세요").min(1),
});
