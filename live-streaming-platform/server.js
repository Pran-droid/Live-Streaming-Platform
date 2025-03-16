const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const activeUsers = {};
const eventRooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinEvent', ({ userId, eventId }) => {
        socket.join(eventId);
        console.log(`User ${userId} joined event ${eventId}`);

        if (!eventRooms[eventId]) {
            eventRooms[eventId] = [];
        }
        eventRooms[eventId].push(userId);

        io.to(eventId).emit('userJoined', { userId, eventId });

        io.to(eventId).emit('participantList', eventRooms[eventId]);
    });

    socket.on('leaveEvent', ({ userId, eventId }) => {
        socket.leave(eventId);
        console.log(`User ${userId} left event ${eventId}`);

        if (eventRooms[eventId]) {
            eventRooms[eventId] = eventRooms[eventId].filter((id) => id !== userId);
        }

        io.to(eventId).emit('userLeft', { userId, eventId });

        io.to(eventId).emit('participantList', eventRooms[eventId]);
    });

    socket.on('sendMessage', ({ eventId, message, senderId }) => {
        const timestamp = new Date().toISOString();
        io.to(eventId).emit('receiveMessage', { senderId, message, timestamp });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);

        for (const [eventId, participants] of Object.entries(eventRooms)) {
            eventRooms[eventId] = participants.filter((id) => id !== socket.id);

            if (participants.includes(socket.id)) {
                io.to(eventId).emit('userLeft', { userId: socket.id, eventId });
                io.to(eventId).emit('participantList', eventRooms[eventId]);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});