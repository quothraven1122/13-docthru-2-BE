export function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}
