import { userRepository } from "./userRepository.js";
import { NotFoundError } from "#src/common/utils/errors.js";
import { filterSensitiveUserData } from "#src/common/utils/utils.js";

export const userService = {
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("유저를 찾을 수 없습니다.");
    }
    return filterSensitiveUserData(user);
  },
};
