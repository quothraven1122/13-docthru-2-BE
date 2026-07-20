import bcrypt from "bcrypt";
import { authRepository } from "./authRepository.js";
import { ConflictError, UnauthorizedError } from "#src/common/utils/errors.js";
import { config } from "#src/common/configs/config.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "#src/common/utils/token.js";

function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

export const authService = {
  async register({ email, nickname, password }) {
    const existingEmail = await authRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError("이미 사용 중인 이메일입니다.");
    }

    const existingNickname = await authRepository.findByNickname(nickname);
    if (existingNickname) {
      throw new ConflictError("이미 사용 중인 닉네임입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = await authRepository.create({ email, nickname, password: hashedPassword });

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    await authRepository.updateRefreshToken(user.id, refreshToken);

    return { user: filterSensitiveUserData(user), accessToken, refreshToken };
  },

  async getUser(email, password) {},

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    await authRepository.updateRefreshToken(user.id, refreshToken);

    return { user: filterSensitiveUserData(user), accessToken, refreshToken };
  },

  async logout(userId) {
    await authRepository.updateRefreshToken(userId, null);
  },
  async refresh(refreshToken) {
    const { id } = verifyRefreshToken(refreshToken);

    const user = await authRepository.findById(id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("유효하지 않은 요청입니다. 다시 로그인해 주세요.");
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    await authRepository.updateRefreshToken(user.id, newRefreshToken);

    return { user: filterSensitiveUserData(user), accessToken, refreshToken: newRefreshToken };
  },
};
