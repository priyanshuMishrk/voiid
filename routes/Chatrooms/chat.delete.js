const express = require('express');
const Chat = require('../../models/chat.model');
const tokenGenerator = require('../../Utils/Authorization');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

/**
 * @swagger
 * /chats/delete:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: 
 *       - Chatrooms
 *     summary: Delete a chat room
 *     description: This endpoint deletes a chat room by its ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chat room to delete.
 *     responses:
 *       200:
 *         description: Chat room deleted successfully.
 *       400:
 *         description: Invalid input or ID not found.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       500:
 *         description: Server error.
 */

// Route to delete a chat room
app.delete('/chats/delete', tokenGenerator.authorizationToken, async (req, res) => {
    try {
        const { id } = req.query;

        // Check if the ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid chat room ID.' });
        }

        // Find and delete the chat room
        const deletedChat = await Chat.findByIdAndDelete(id);

        // If the chat room doesn't exist
        if (!deletedChat) {
            return res.status(400).json({ message: 'Chat room not found.' });
        }

        // Return success response
        res.status(200).json({ message: 'Chat room deleted successfully.', chat: deletedChat });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
        console.error(error);
    }
});

module.exports = app;
