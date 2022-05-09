import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const app = express()

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join_room', (roomName) => {
    socket.join(roomName)
    socket.to(roomName).emit('welcome')
  })

  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer)
  })

  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer)
  })

  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice)
  })
})

httpServer.listen(3001, () => console.log('server is running on 3001'))