import { parseOrigin } from "#src/common/utils/utils.js";

//토큰 유효기간 (초 단위)
const ACCESS_EXPIRES_IN_SEC = 60 * 60;
const REFRESH_EXPIRES_IN_SEC = 7 * 24 * 60 * 60;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const isProduction = process.env.NODE_ENV === "production";

export const config = {
  isProduction,
  //배포한 FE주소. 프로덕션에서 값이 없으면 전체 허용(true)이 아니라 전체 차단(false)으로 fail-safe 처리
  clientOrigin: isProduction ? parseOrigin(CLIENT_ORIGIN, false) : parseOrigin(CLIENT_ORIGIN, true),
  jwt: {
    accessSecret: process.env.ACCESS_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
    accessExpiresIn: ACCESS_EXPIRES_IN_SEC, // jsonwebtoken expiresIn용
    refreshExpiresIn: REFRESH_EXPIRES_IN_SEC,
    accessExpiresInMs: ACCESS_EXPIRES_IN_SEC * 1000, // 쿠키 maxAge용
    refreshExpiresInMs: REFRESH_EXPIRES_IN_SEC * 1000,
  },
  //해시
  bcrypt: {
    saltRounds: 10,
  },
};
