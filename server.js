const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and their locations
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle new user connection
  socket.on('userConnected', (userId) => {
    connectedUsers.set(socket.id, { userId, location: null });
    io.emit('updateUserList', Array.from(connectedUsers.values()));
  });

  // Handle location updates
  socket.on('locationUpdate', (location) => {
    if (connectedUsers.has(socket.id)) {
      const user = connectedUsers.get(socket.id);
      user.location = location;
      connectedUsers.set(socket.id, user);
      io.emit('locationUpdated', Array.from(connectedUsers.values()));
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    connectedUsers.delete(socket.id);
    io.emit('updateUserList', Array.from(connectedUsers.values()));
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});