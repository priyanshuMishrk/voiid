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
    read: msg.is_read
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

      const chatId = data.Chatroom_id
      const messageData = {
          _id: new mongoose.Types.ObjectId(),
          chat_id: chatId,
          sender: data.userId,
          content: data.Content,
          message_type: "text",
          media_url: "",
          is_read: false,
          created_at: new Date()
      };

      // Save the message to the database
      message.create(messageData)
      .then(() => {
          console.log('Message saved to the database');
      })
      .catch((error)=> {
        console.log(error)  
      })

      const allMessages = await message.find({chat_id: chatId})
      console.log(allMessages)

      const responseMessage = createChatObject(allMessages)
      console.log(responseMessage)

      // Emit a response back to the client on the same event
      // socket.emit('responseMessage',allMessages);
      io.to(chatId).emit('responseMessage',allMessages);
  });

  socket.on('userEnter', async (userId) => {
    console.log('User entered:', userId);
  
    try {
      // Find all chatrooms where the user is a participant
      const userChats = await chat.find({ participants: userId });
  
      if (userChats.length > 0) {
        console.log(`User ${userId} is part of the following chatrooms:`);
        console.log(userChats);
  
        // Emit the list of chatrooms back to the user
        socket.emit('userChatRooms', userChats);
      } else {
        console.log(`No chatrooms found for user ${userId}`);
        socket.emit('userChatRooms', []);  // Send an empty array if no chatrooms are found
      }
  
    } catch (error) {
      console.error('Error finding chatrooms for user:', error);
      socket.emit('error', 'Failed to load chatrooms');
    }
  });

  // Listen for 'userChat' from the client
  socket.on('userChat', async (chatroomId) => {
    console.log('Chatroom accessed by user:', chatroomId);

    // Fetch all messages from the chatroom
    const chatMessages = await message.find({ chat_id: chatroomId });
    const responseMessage = createChatObject(chatMessages)

    // Send the chatroom messages back to the user
    socket.emit('chatroomMessages', responseMessage);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
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


