import { ForbiddenError } from "#src/common/utils/errors.js";

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    throw new ForbiddenError("관리자만 접근할 수 있습니다.");
  }
  next();
};
