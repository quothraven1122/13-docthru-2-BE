//토큰 유효기간 (초 단위)
const ACCESS_EXPIRES_IN_SEC = 60 * 60;
const REFRESH_EXPIRES_IN_SEC = 7 * 24 * 60 * 60;

export const config = {
  isProduction: process.env.NODE_ENV === "production",
  clientOrigin: process.env.CLIENT_ORIGIN?.split(",") ?? true, //배포한 FE주소
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
