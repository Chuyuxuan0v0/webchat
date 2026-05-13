import http from 'http'
import { Server } from 'socket.io'
import app from './app'
import dotenv from 'dotenv'
import { initSocketIO } from './socket'

dotenv.config()

const PORT = process.env.PORT || 3000
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

initSocketIO(io)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { server, io }
