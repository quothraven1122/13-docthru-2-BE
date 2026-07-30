import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "docthru API",
      version: "1.0.0",
      description: "docthru 서비스 API 명세서",
    },
    servers: [{ url: "http://localhost:3001", description: "로컬 개발 서버" }],
    tags: [
      { name: "Auth", description: "인증 관련 API" },
      { name: "Users", description: "유저 관련 API" },
      { name: "Like", description: "좋아요 관련 API" },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "b3f1c2a0-1234-4a5b-8c9d-abcdef123456" },
            email: { type: "string", format: "email", example: "user@example.com" },
            nickname: { type: "string", example: "닉네임" },
            role: { type: "string", enum: ["MEMBER", "ADMIN"], example: "MEMBER" },
            grade: { type: "string", enum: ["NORMAL", "EXPERT"], example: "NORMAL" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "nickname", "password", "passwordConfirm"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            nickname: { type: "string", minLength: 2, maxLength: 10, example: "닉네임" },
            password: { type: "string", minLength: 9, example: "password123" },
            passwordConfirm: { type: "string", minLength: 9, example: "password123" },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            path: { type: "string", example: "/auth/register" },
            method: { type: "string", example: "POST" },
            message: { type: "string", example: "이미 사용 중인 이메일입니다." },
            date: { type: "string", format: "date-time" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            path: { type: "string", example: "/auth/register" },
            method: { type: "string", example: "POST" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "올바른 이메일 형식이 아닙니다." },
                },
              },
            },
            date: { type: "string", format: "date-time" },
          },
        },
        Like: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "b3f1c2a0-1234-4a5b-8c9d-abcdef123456" },
            likerId: { type: "string", format: "uuid" },
            translationId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        LikeToggleResponse: {
          type: "object",
          description: "liked가 true면 like 객체가 함께, false면 like 필드 없이 반환됩니다.",
          properties: {
            liked: { type: "boolean", example: true },
            like: { $ref: "#/components/schemas/Like" },
          },
        },
        LikeCountResponse: {
          type: "object",
          properties: {
            count: { type: "integer", example: 12 },
          },
        },
        LikeStatusResponse: {
          type: "object",
          properties: {
            isLiked: { type: "boolean", example: true },
          },
        },
      },
    },
  },
  apis: ["./src/modules/**/*Route.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
