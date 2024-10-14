const express = require("express");
const http = require('http');
const socketIo = require('socket.io');



function messageReceiver(app){
    const server = http.createServer(app);
    const io = socketIo(server);
    io.on('connection', (socket) => {
        console.log('A user connected');
      
        // User joins a specific room for messaging and video calls
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
      
            // Send existing message history when a user joins
            if (messageHistory[roomId]) {
                socket.emit('messageHistory', messageHistory[roomId]);
            } else {
                messageHistory[roomId] = []; // Initialize message history for the room
            }
        });
      
        // Handle messaging
        socket.on('sendMessage', (data) => {
            const { roomId, message, sender } = data;
      
            // Store the message in the room's message history
            messageHistory[roomId].push({ sender, message, timestamp: new Date() });
      
            // Emit the message to other users in the room
            io.to(roomId).emit('receiveMessage', { sender, message, timestamp: new Date() });
        });
      
        // Handle WebRTC signaling for video/voice calls
        socket.on('offer', (data) => {
            io.to(data.roomId).emit('offer', data.offer);
        });
      
        socket.on('answer', (data) => {
            io.to(data.roomId).emit('answer', data.answer);
        });
      
        socket.on('ice-candidate', (data) => {
            io.to(data.roomId).emit('ice-candidate', data.candidate);
        });
      
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
      });
}

module.exports = messageReceiver