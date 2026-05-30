import { User } from '../../models';
import { AppError } from '../../middleware/error.middleware';

export const userService = {
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user.toJSON();
  },

  async updateProfile(userId: string, data: { username?: string; avatar?: string }) {
    if (data.username && data.username.length < 2) {
      throw new AppError(400, 'Username must be at least 2 characters');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user.toJSON();
  },

  async getOnlineUsers() {
    const users = await User.find({ status: 'online' }).select('-password');
    return users;
  },
};
