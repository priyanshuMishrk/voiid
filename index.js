const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const messagingRealTime = require('./LiveMessagin');
const swaggerOptions = require("./swaggerOptions");
const userEndpoint = require('./routes/User');
const chatEndpoint = require('./routes/Chatrooms');
const http = require('http');
const socketIo = require('socket.io');
const message = require('./models/message.model');
const chat = require('./models/chat.model');
const mongoose = require('mongoose');

messagingRealTime();  // Initialize the messaging module

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // Initialize Socket.IO

const PORT = 3000;

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'messageSent' from the client
  socket.on('messageSent', async (data) => {
      console.log('Message received from client:', data);

      // Process the received data (e.g., modify it, save it, etc.)
      const responseMessage = {
          name: data.name,
          message: `Hello ${data.userId}, your message was received!`,
          content : `${data.Content}`
      };

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

      // Emit a response back to the client on the same event
      socket.emit('responseMessage',allMessages);
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
