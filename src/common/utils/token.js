import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";
import { UnauthorizedError } from "./errors.js";

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("토큰이 만료되었습니다. 다시 로그인해 주세요.");
    }
    throw new UnauthorizedError("유효하지 않은 토큰입니다. 다시 로그인해 주세요.");
  }
}

export function verifyAccessToken(token) {
  return verifyToken(token, config.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return verifyToken(token, config.jwt.refreshSecret);
}
