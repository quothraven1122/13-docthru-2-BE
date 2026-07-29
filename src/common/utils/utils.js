export function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

//cors origin 검사 함수
export function parseOrigin(envValue, defaultValue) {
  const raw = envValue?.trim();
  return raw ? raw.split(",") : defaultValue;
}
