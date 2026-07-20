import { verifyAccessToken } from "#src/common/utils/token.js";
import { UnauthorizedError } from "#src/common/utils/errors.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("인증 토큰이 필요합니다. 로그인 후 이용해 주세요.");
  }

  const token = authHeader.slice("Bearer ".length);
  req.user = verifyAccessToken(token);
  next();
};
