import { verifyAccessToken } from "#src/common/utils/token.js";
import { UnauthorizedError } from "#src/common/utils/errors.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new UnauthorizedError("인증 토큰이 필요합니다. 로그인 후 이용해 주세요.");
  }

  req.user = verifyAccessToken(token);
  next();
};
