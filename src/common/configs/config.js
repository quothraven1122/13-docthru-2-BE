export const config = {
  isProduction: process.env.NODE_ENV === "production",
  jwt: {
    accessSecret: process.env.ACCESS_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
    //토큰 유효기간
    accessExpiresIn: "60m",
    refreshExpiresIn: "7d",
  },
  //해시
  bcrypt: {
    saltRounds: 10,
  },
};
