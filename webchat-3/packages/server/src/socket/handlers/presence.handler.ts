import { Server, Socket } from 'socket.io';
import { User } from '../../models';

export const presenceHandler = (io: Server, socket: Socket) => {
  const userId = (socket as any).userId;

  User.findByIdAndUpdate(userId, { status: 'online' })
    .then((user) => {
      if (user) {
        io.emit('user:online', {
          userId: (user as any)._id.toString(),
          username: user.username,
        });
      }
    })
    .catch(console.error);

  socket.on('disconnect', async () => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { status: 'offline' },
        { new: true }
      );

      if (user) {
        io.emit('user:offline', {
          userId: (user as any)._id.toString(),
          username: user.username,
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });
};
