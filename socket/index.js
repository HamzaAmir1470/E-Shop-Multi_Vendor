const socketIO = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

require('dotenv').config({
    path: "./.env"
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Socket.IO server is running');
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
    return users.find((user) => user.userId === receiverId);
}

// Define a message object with seem property
const createMessage = ({ senderId, receiverId, text, images }) => {
    return {
        senderId,
        receiverId,
        text,
        images,
        seen: false,
    }
};

io.on('connection', (socket) => {

    // when connect
    console.log('A user connected: ' + socket.id);

    // take userId and socketId from user
    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
    });

    // send and get message
    const messages = []; //Object to track messages sent to each user
    socket.on('sendMessage', ({ senderId, receiverId, text, images }) => {
        const message = createMessage({ senderId, receiverId, text, images });
        messages.push(message);
        const user = getUser(receiverId);
        // Store the message in the messages object
        if (!messages[receiverId]) {
            messages[receiverId] = [message];
        } else {
            messages[receiverId].push(message);
        }
        // send the message to the receiver
        io.to(user.socketId).emit('getMessage', message);
    });

    socket.on('messageSeen', ({ senderId, receiverId, messageId }) => {
        const user = getUser(senderId);
        // Update the seen status of the message in the messages object
        if (messages[senderId]) {
            const message = messages[senderId].find((msg) => msg.receiverId === receiverId && msg.id === messageId);
            if (message) {
                message.seen = true;
                // Notify the sender that the message has been seen
                io.to(user?.socketId).emit('messageSeen', {
                    senderId,
                    receiverId,
                    messageId
                });
            }
        }
    });

    // update and get last message
    socket.on('updateLastMessage', ({ lastMessageId, lastMessage }) => {
       io.emit('getLastMessage', { lastMessageId, lastMessage });
    });

    // when disconnect
    socket.on('disconnect', () => {
        removeUser(socket.id);
        console.log('User disconnected: ' + socket.id);
        io.emit('getUsers', users);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});