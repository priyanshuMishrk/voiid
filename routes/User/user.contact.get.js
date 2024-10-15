const express = require('express');
const User = require('../../models/user.model');
const connectDB = require('../../db');
const { isValidObjectId } = require('../../Utils/Mongoose');

connectDB();

const app = express();

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Operations related to users.

 * /users/contacts/search:
 *   post:
 *     tags:
 *       - User
 *     summary: Get users by phone numbers
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of phone numbers to search for users
 *     responses:
 *       200:
 *         description: A list of user data matching the phone numbers
 *       500:
 *         description: Server error
 *       404:
 *         description: No users found for the provided numbers
 */
// Example route to find users by phone numbers
app.post('/users/contacts/search', async (req, res) => {
    try {
        const go = req.body.numbers;

        // Ensure 'go' is an array of phone numbers
        const numbersArray = Array.isArray(go) ? go : [go];

        if (numbersArray.length > 0) {
            const users = await User.find({
                phNo: {
                    $in: numbersArray
                }
            });
            if (users.length > 0) {
                return res.json(users);
            } else {
                return res.status(404).send({
                    type: 'error',
                    message: 'No users found for the provided numbers.'
                });
            }
        } else {
            return res.status(400).send({
                type: 'error',
                message: 'No number exists in the request.'
            });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = app;
