import { SocketUser } from './index'

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser
  }
}
