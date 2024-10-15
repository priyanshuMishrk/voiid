const express = require('express');
const Chat = require('../../models/chat.model');
const connectDB = require('../../db');
const { createValidator } = require('express-joi-validation');
const { userSchema } = require('../../joi/user.joi')
const encryptor = require('../../Utils/Pass')
const tokenGenerator = require('../../Utils/Authorization')
const mongoose = require('mongoose');

connectDB()

const app = express();
const validator = createValidator();

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: Chatrooms
 *     description: Operations related to Chatrooms.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /chats:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: 
 *       - Chatrooms
 *     summary: Create a new chat room
 *     description: This endpoint creates a new chat room for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of chatroom. Possible values are 'private' for personal chat or 'group' for group chat.
 *                 example: private
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of IDs of participants in the room. Do not include the current user's ID (which will be taken from the header).
 *                 example: 
 *                   - 66e927d41bf19fcac400a97a
 *                   - 66e9293abe5773da13505932
 *               group_name:
 *                 type: string
 *                 description: Required only for group chats. The name of the group chat.
 *                 example: Walkers
 *               group_image:
 *                 type: string
 *                 description: Required only for group chats. The URL of the group chat image.
 *                 example: https://example.com/group_image.jpg
 *     responses:
 *       201:
 *         description: Chat room created successfully. Returns the chatroom data.
 *       400:
 *         description: Invalid input, object invalid.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       500:
 *         description: Server error.
 */

// Example route to find a user
app.post('/chats', tokenGenerator.authorizationToken, async (req, res) => {
    try {
        const {
            type,
            participants,
            group_name,
            group_image
        } = req.body;

        // Ensure type is valid
        if (type === 'private' && participants.length > 2) {
            return res.status(400).send('The chatroom consists of multiple users but the chatroom type is set as private.');
        }

        // Validate participants array
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ message: 'Participants array is required and cannot be empty.' });
        }

        // Get the current user from the authorization token (assumed to be set in middleware)
        const currentUserId = req.user._id;  // Assuming the token middleware sets req.user
        participants.push(currentUserId);  // Add the current user to participants

        // Prepare the chatroom data
        const chatData = {
            _id: new mongoose.Types.ObjectId(),
            type,
            participants,
            group_name: type === 'group' ? group_name : undefined,  // Only for group chats
            group_image: type === 'group' ? group_image : undefined,  // Only for group chats
            admin: type === 'group' ? currentUserId : undefined,  // Admin for group chats is the creator
            created_at: Date.now()
        };

        // Create new chatroom
        const newChat = new Chat(chatData);
        await newChat.save();

        // Send response with the created chatroom data
        res.status(201).json({
            message: 'Chatroom created successfully',
            chat: newChat
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
        console.error(error);
    }
});

module.exports = app;
