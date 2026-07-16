const socketIO = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

require('dotenv').config({
    path: "./.env"
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Socket.IO server is running');
});

let users = [];
let conversations = new Map(); // Track conversation last messages
let typingUsers = new Map(); // Track typing status

const addUser = (userId, socketId) => {
    // Check if user already exists, if yes, update socketId
    const existingUserIndex = users.findIndex((user) => user.userId === userId);
    if (existingUserIndex !== -1) {
        users[existingUserIndex].socketId = socketId;
    } else {
        users.push({ userId, socketId });
    }
    console.log(`User ${userId} added with socket ${socketId}`);
}

const removeUser = (socketId) => {
    const removedUser = users.find((user) => user.socketId === socketId);
    users = users.filter((user) => user.socketId !== socketId);
    if (removedUser) {
        console.log(`User ${removedUser.userId} removed`);
    }
};

const getUser = (receiverId) => {
    return users.find((user) => user.userId === receiverId);
}

const getOnlineUsers = () => {
    return users.map(user => user.userId);
}

// Define a message object with seen property
const createMessage = ({ senderId, receiverId, text, images, conversationId }) => {
    return {
        id: Date.now().toString(),
        senderId,
        receiverId,
        text,
        images,
        conversationId,
        seen: false,
        createdAt: new Date(),
    }
};

io.on('connection', (socket) => {

    // when connect
    console.log('A user connected: ' + socket.id);

    // take userId and socketId from user
    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
        // Send online users list to all connected clients
        io.emit('onlineUsers', getOnlineUsers());
    });

    // Handle typing status
    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
        const receiver = getUser(receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit('typing', {
                senderId,
                isTyping,
                timestamp: Date.now()
            });
        }

        // Track typing users
        if (isTyping) {
            const key = `${senderId}-${receiverId}`;
            typingUsers.set(key, {
                senderId,
                receiverId,
                timestamp: Date.now()
            });

            // Auto-clear typing after 3 seconds if not updated
            setTimeout(() => {
                const current = typingUsers.get(key);
                if (current && Date.now() - current.timestamp >= 3000) {
                    typingUsers.delete(key);
                    if (receiver) {
                        io.to(receiver.socketId).emit('typing', {
                            senderId,
                            isTyping: false,
                            timestamp: Date.now()
                        });
                    }
                }
            }, 3000);
        } else {
            const key = `${senderId}-${receiverId}`;
            typingUsers.delete(key);
        }
    });

    // send and get message with real-time delivery
    socket.on('sendMessage', ({ senderId, receiverId, text, images, conversationId }) => {
        const message = createMessage({ senderId, receiverId, text, images, conversationId });

        // Store message for the receiver
        const receiver = getUser(receiverId);
        const sender = getUser(senderId);

        // Emit to receiver if online
        if (receiver) {
            io.to(receiver.socketId).emit('getMessage', {
                ...message,
                receiverId,
                senderId
            });
            console.log(`Message sent from ${senderId} to ${receiverId}`);
        } else {
            console.log(`User ${receiverId} is offline, message stored for later`);
        }

        // Also send confirmation back to sender
        if (sender) {
            io.to(sender.socketId).emit('messageSent', {
                ...message,
                status: 'delivered'
            });
        }

        // Update conversation last message
        updateConversationLastMessage(conversationId, text || "📷 Photo", senderId);
    });

    // Handle conversation updates
    socket.on('updateConversation', ({ conversationId, lastMessage, lastMessageId }) => {
        // Store conversation last message
        conversations.set(conversationId, {
            lastMessage,
            lastMessageId,
            updatedAt: new Date()
        });

        // Broadcast to all users in the conversation
        const conversationUsers = Array.from(users).filter(user =>
            user.conversationId === conversationId
        );

        conversationUsers.forEach(user => {
            const socketUser = getUser(user.userId);
            if (socketUser) {
                io.to(socketUser.socketId).emit('conversationUpdated', {
                    conversationId,
                    lastMessage,
                    lastMessageId,
                    updatedAt: new Date()
                });
            }
        });
    });

    // Handle message seen
    socket.on('messageSeen', ({ senderId, receiverId, messageId, conversationId }) => {
        const sender = getUser(senderId);
        if (sender) {
            io.to(sender.socketId).emit('messageSeen', {
                senderId,
                receiverId,
                messageId,
                conversationId,
                seenAt: new Date()
            });
        }

        // Emit to all participants that message was seen
        const receiver = getUser(receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit('messageSeenConfirmation', {
                messageId,
                conversationId,
                seenBy: receiverId
            });
        }
    });

    // update and get last message (enhanced)
    socket.on('updateLastMessage', ({ lastMessageId, lastMessage, conversationId }) => {
        // Update conversation in memory
        conversations.set(conversationId, {
            lastMessage,
            lastMessageId,
            updatedAt: new Date()
        });

        // Broadcast to all connected users in this conversation
        const conversation = Array.from(users).filter(user =>
            users.some(u => u.userId === lastMessageId || u.userId === conversationId)
        );

        io.emit('getLastMessage', {
            lastMessageId,
            lastMessage,
            conversationId,
            updatedAt: new Date()
        });

        // Also emit specific conversation update
        io.emit('messageUpdate', {
            conversationId,
            lastMessage,
            lastMessageId
        });
    });

    // Handle user disconnection with cleanup
    socket.on('disconnect', () => {
        const disconnectedUser = users.find((user) => user.socketId === socket.id);
        removeUser(socket.id);
        console.log('User disconnected: ' + socket.id);

        // Update online users list for all clients
        io.emit('getUsers', users);
        io.emit('onlineUsers', getOnlineUsers());

        // Notify others that user went offline
        if (disconnectedUser) {
            io.emit('userOffline', {
                userId: disconnectedUser.userId,
                timestamp: new Date()
            });
        }
    });

    // Handle reconnect
    socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });

    // Get online users list
    socket.on('getOnlineUsers', () => {
        socket.emit('onlineUsers', getOnlineUsers());
    });

    // Join conversation room
    socket.on('joinConversation', ({ conversationId, userId }) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);

        // Add conversation to user's list
        const user = users.find(u => u.userId === userId);
        if (user) {
            user.conversationId = conversationId;
        }
    });

    // Leave conversation room
    socket.on('leaveConversation', ({ conversationId, userId }) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);

        const user = users.find(u => u.userId === userId);
        if (user) {
            delete user.conversationId;
        }
    });
});

// Helper function to update conversation last message
function updateConversationLastMessage(conversationId, lastMessage, lastMessageId) {
    conversations.set(conversationId, {
        lastMessage,
        lastMessageId,
        updatedAt: new Date()
    });

    // Broadcast update to all users in the conversation
    io.emit('conversationListUpdate', {
        conversationId,
        lastMessage,
        lastMessageId,
        updatedAt: new Date()
    });
}

// Periodically clean up stale typing indicators (every 10 seconds)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of typingUsers.entries()) {
        if (now - value.timestamp > 5000) { // 5 seconds stale
            typingUsers.delete(key);
            const { senderId, receiverId } = value;
            const receiver = getUser(receiverId);
            if (receiver) {
                io.to(receiver.socketId).emit('typing', {
                    senderId,
                    isTyping: false,
                    timestamp: now
                });
            }
        }
    }
}, 10000);

// Error handling for the server
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Avoid port binding if deploying to serverless/Vercel functions
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`Socket.IO server is running on port ${PORT}`);
        console.log(`CORS enabled for http://localhost:3000`);
    });
}

// VERCEL REQUIREMENT: Export the express app/server instance directly as a default export module
module.exports = server;