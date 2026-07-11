import { io } from 'socket.io-client'

let socket = null

export const initSocket = (userId) => {
  if (socket?.connected) return

  socket = io('/', { withCredentials: true, transports: ['websocket', 'polling'] })

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id)
    socket.emit('join', userId)
  })

  socket.on('disconnect', () => console.log('🔌 Socket disconnected'))

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const onNotification = (callback) => {
  if (socket) socket.on('new_notification', callback)
}

export const offNotification = (callback) => {
  if (socket) socket.off('new_notification', callback)
}

export const onAttendanceUpdate = (callback) => {
  if (socket) socket.on('attendance_update', callback)
}
