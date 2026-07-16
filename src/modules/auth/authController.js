import { authService } from "./authService.js";
import { config } from "#src/common/configs/config.js";
import { asyncHandler } from "#src/common/utils/asyncHandler.js";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: config.isProduction ? "none" : "lax", //배포하는 사이트가 달라서 none 필요
  secure: config.isProduction, //http허용 불허용 로컬 환경은 http라 false가 필요
  path: "/auth/refresh-token",
};

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.validatedData);

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(201).json({ user, accessToken });
  }),

  login: asyncHandler(async (req, res) => {}),
  logout: asyncHandler(async (req, res) => {}),
  refreshToken: asyncHandler(async (req, res) => {}),
};
