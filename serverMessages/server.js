const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

const port = 6000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', socket => {
    console.log(`User connection: ${socket.id}`);
    
    socket.on('send_message', (message, room) => {
        socket.to(room).emit('receive_message', message);
    });

    socket.on('join_room', (room) => {
        socket.join(room);
    });

    socket.on('leave_room', (room) => {
        socket.leave(room);
    });
})

server.listen(() => {
    console.log(`Server is listening on port ${port}`);
});