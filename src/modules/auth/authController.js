import { authService } from "./authService.js";
import { config } from "#src/common/configs/config.js";
import { asyncHandler } from "#src/common/utils/asyncHandler.js";
import { UnauthorizedError } from "#src/common/utils/errors.js";

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

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.validatedData);

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(200).json({ user, accessToken });
  }),
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);

    res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(200).json({ message: "로그아웃되었습니다." });
  }),
  refreshToken: asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError("refresh token이 없습니다. 다시 로그인해 주세요.");
    }

    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(200).json({ user, accessToken });
  }),
};
