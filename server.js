const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let onlineUsers = [];

// Serve static files from the public directory
app.use(express.static(path.join(__dirname)));

// Serve the index.html file when accessing the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', (username) => {
        socket.username = username;
        onlineUsers.push(username);
        io.emit('updateUsers', onlineUsers);
        io.emit('message', { user: 'system', text: `${username} has joined.` });
    });

    socket.on('sendMessage', (message) => {
        io.emit('message', { user: socket.username, text: message });
    });

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(user => user !== socket.username);
        io.emit('updateUsers', onlineUsers);
        io.emit('message', { user: 'system', text: `${socket.username} has left.` });
        console.log('client disconnected');
    });
});

server.listen(4000, () => console.log('Server listening on port 4000'));
