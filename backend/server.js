// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Chat Message
    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        io.emit('receive_message', data);
    });

    // Call Handling
    socket.on('callUser', (data) => {
        console.log('Call user:', data);
        // Since target nahi diya, hum broadcast kar rahe (demo ke liye)
        socket.broadcast.emit('callUser', { from: data.from, signal: data.signalData });
    });

    socket.on('answerCall', (data) => {
        console.log('Answering call:', data);
        io.to(data.to).emit('callAccepted', data.signal);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.get('/', (req, res) => {
    res.send('Chat server is running...');
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
