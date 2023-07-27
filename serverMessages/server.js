const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

const port = 4000;

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
        console.log('send message to ' + room);
        socket.to(room).emit('receive_message', message);
    });

    socket.on('delete_message', (message, room) => {
        console.log('delete message ' + message.id);
        socket.to(room).emit('del_message', message);
    });

    socket.on('add_group', (group, users) => {
        users.forEach(user => {
            socket.to(user.id).emit('join_group', group);
        });
    })

    socket.on('leave_group',( groupId, userId) => {
        socket.to(`group${groupId}`).emit('left_group', groupId, userId);
    })

    socket.on('join_room', (room) => {
        socket.join(room);
    });

    socket.on('leave_room', (room) => {
        socket.leave(room);
    });

    socket.on("disconnct", () => {
        socket.disconnect();
    })
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});