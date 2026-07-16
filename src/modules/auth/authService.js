import { authRepository } from "./authRepository";
export const authService = {
  async register({ email, nickname, password }) {},
  async getUser(email, password) {},
  async login(userId) {},
  async logout(userId) {},
  async refresh(userId, refreshToken) {},
};
