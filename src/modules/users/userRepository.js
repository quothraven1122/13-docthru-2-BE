import prisma from "#src/common/configs/prisma.js";

export const userRepository = {
  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },
};
