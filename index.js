const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// const messagingRealTime = require('./LiveMessagin');
const swaggerOptions = require("./swaggerOptions");
const userEndpoint = require('./routes/User');
const chatEndpoint = require('./routes/Chatrooms');
const http = require('http');
const socketIo = require('socket.io');
const message = require('./models/message.model');
const chat = require('./models/chat.model');
const mongoose = require('mongoose');

// messagingRealTime();  // Initialize the messaging module
const rooms = new Map();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // Initialize Socket.IO

const PORT = 3000;

function createChatObject(messagesArray) {
  if (messagesArray.length === 0) return {};

  // Extract chat_id from the first message object
  const chatroomId = messagesArray[0].chat_id;

  // Transform each message object to the desired structure
  const messages = messagesArray.map(msg => ({
    sender: msg.sender,
    content: msg.content,
    timestamp: msg.created_at,
    read: msg.is_read,
    mediaUrl: msg.media_url || '', 
    audio_url :  msg.audio_url || '',         // Store media_url or empty string if not present
    messageType: msg.message_type || '' ,    // Store message_type or empty string if not present
    caption : msg.caption || '',  
  }));

  // Return the final object
  return {
    chatroomid: chatroomId,
    messages: messages
  };
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'messageSent' from the client
  socket.on('messageSent', async (data) => {
      console.log('Message received from client:', data);

      // Process the received data (e.g., modify it, save it, etc.)

      // {
      //   0|index  |   chat_id: '6710c1be58c2cd01f75bad75',
      //   0|index  |   sender: '6710c0bd58c2cd01f75bab73',
      //   0|index  |   content: 'hey',
      //   0|index  |   message_type: 'image',
      //   0|index  |   media_url: 'https://res.cloudinary.com/black-box/image/upload/v1729148384/voiidChat/chatImages.jpg',
      //   0|index  |   is_read: false,
      //   0|index  |   deleted: false,
      //   0|index  |   created_at: '2024-10-17T15:05:59.984665',
      //   0|index  |   room: '6710c1be58c2cd01f75bad75'
      //   0|index  | }

      const chatId = data.chat_id
      const messageData = {
          _id: new mongoose.Types.ObjectId(),
          chat_id: chatId,
          sender: data.userId,
          content: data.content ? data.content : '',
          caption : data.caption ? data.caption : '',
          message_type: data.message_type ? data.message_type : "text",
          media_url: data.mediaUrl ? data.mediaUrl : '',
          is_read: false,
          created_at: new Date()
      };

      // Save the message to the database
      const messageLatest = await message.create(messageData)
      // .then(() => {
      //     console.log('Message saved to the database');
      // })
      // .catch((error)=> {
      //   console.log(error)  
      // })

      const allMessages = await message.find({chat_id: chatId}).sort({ createdAt: -1 });
      console.log(allMessages)

      const responseMessage = createChatObject(allMessages)
      console.log(responseMessage)

      // Emit a response back to the client on the same event
      // socket.emit('responseMessage',allMessages);
      io.to(chatId).emit('responseMessage',allMessages);
  });

  socket.on('userEnter', async (userId) => {
    // console.log('User entered:', userId);
  
    try {
      // Find all chatrooms where the user is a participant
      const userChats = await chat.find({ participants: userId });
  
      if (userChats.length > 0) {
        // console.log(`User ${userId} is part of the following chatrooms:`);
        // console.log(userChats);
  
        // Emit the list of chatrooms back to the user
        socket.emit('userChatRooms', userChats);
      } else {
        // console.log(`No chatrooms found for user ${userId}`);
        socket.emit('userChatRooms', []);  // Send an empty array if no chatrooms are found
      }
  
    } catch (error) {
      console.error('Error finding chatrooms for user:', error);
      socket.emit('error', 'Failed to load chatrooms');
    }
  });

  socket.on('audioClipSent', async (data) => {
    console.log('Audio clip received:', data);

    const chatId = data.chat_id;
    const audioMessageData = {
      _id: new mongoose.Types.ObjectId(),
      chat_id: chatId,
      sender: data.userId,
      content: data.content ? data.content : '',  
      message_type: 'audio',
      media_url: data.mediaUrl ? data.mediaUrl : '',
      audio_url : data.audio_url ? data.audio_url : '',  // Assuming the client sends a URL of the audio clip
      is_read: false,
      caption : data.caption ? data.caption : '',
      created_at: new Date(),
    };

    // Save the audio clip message to the database
    const savedAudioMessage = await message.create(audioMessageData);

    // Retrieve all messages including the new audio clip for the chat room
    const allMessages = await message.find({ chat_id: chatId }).sort({ created_at: -1 });

    const responseMessage = createChatObject(allMessages);
    // console.log(responseMessage);

    // Emit the updated messages to all clients in the chat room
    io.to(chatId).emit('responseMessage', responseMessage);
  });

  // Listen for 'userChat' from the client
  socket.on('userChat', async (chatroomId) => {
    socket.join(chatroomId);
    // console.log('Chatroom accessed by user:', chatroomId);

    // Fetch all messages from the chatroom
    const chatMessages = await message.find({ chat_id: chatroomId });
    const responseMessage = createChatObject(chatMessages)

    // Send the chatroom messages back to the user
    socket.emit('chatroomMessages', responseMessage);
  });

  socket.on('disconnect-app', () => {
      console.log('User disconnected');
  });


  socket.on('join-room-app', (data) => {
    const { roomId, userName } = data;
    socket.join(roomId);  // Join the user to the chatroom
    console.log(`${userName} has joined room: ${roomId}`);
  });

 socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    // console.log(User ${socket.id} joined room ${roomId});
  });

  socket.on('initiate-call', (data) => {
    const { roomId, callerName, receiverName } = data;
    console.log(data, 'initiate-call log');
socket.join(roomId);  
    socket.to(roomId).emit('incoming-call', { callerName, roomId, receiverName });
    // io.to(roomId).emit('incoming-call', { callerName, roomId, receiverName });
    // console.log(Call initiated in room ${roomId} by ${callerName} to ${receiverName});
  });

  socket.on('accept-call', (data) => {
    const { roomId } = data;
    socket.join(roomId);
    io.to(roomId).emit('call-accepted', { roomId });
    // console.log(Call accepted in room ${roomId});
  });

  socket.on('reject-call', (data) => {
    const { roomId } = data;
    socket.join(roomId);
    io.to(roomId).emit('call-rejected', { roomId });
    // console.log(Call rejected in room ${roomId});
  });

  socket.on('signal', (data) => {
    const { roomId } = data;
    console.log(`Signaling data received in room ${roomId}`);
    console.log(`Signaling data: ${JSON.stringify(data)}`);
    socket.join(roomId);
    io.to(roomId).emit('signal', data);
    // console.log(Signaling data sent in room ${roomId});
  });

  socket.on('end-call', (data) => {
    const { roomId } = data;
    socket.join(roomId);
    io.to(roomId).emit('end-call', { roomId });
    // console.log(Call ended in room ${roomId});
    
    // Clean up the room
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // socket.join(roomId);
    // Clean up any rooms the user was in
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        if (participants.size === 0) {
          rooms.delete(roomId);
        } else {
          // Notify other participants that this user has left
          io.to(roomId).emit('user-disconnected', { userId: socket.id });
        }
      }
    });
  });
  //   socket.broadcast.emit('user-left', socket.id);
  // });
});

// Swagger setup
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(userEndpoint);  
app.use(chatEndpoint); // Your routes

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});


