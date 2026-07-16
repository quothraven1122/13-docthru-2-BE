import prisma from "#src/common/configs/prisma.js";

export const authRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  findByNickname(nickname) {
    return prisma.user.findUnique({ where: { nickname } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.user.create({ data });
  },

  updateRefreshToken(id, refreshToken) {
    return prisma.user.update({ where: { id }, data: { refreshToken } });
  },
};
