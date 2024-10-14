const express = require('express');
const User = require('../../models/user.model');
const connectDB = require('../../db');
const { isValidObjectId } = require('../../Utils/Mongoose');

connectDB()

const app = express();

connectDB();

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Operations related to users.

 * /users/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get a user by ID (only to be used when viewing someone else's profile)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user data
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *       400: 
 *          description: message provides the key of request body which has issuers
 * 
 */

// Example route to find a user
app.get('/users/:id', async (req, res) => {
    const go = isValidObjectId(req.params.id)
    try {
        if (go){
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ 
                    type: 'error', 
                    message: 'User not found' 
                });
            }
            res.json(user);
        }else {
            return res.status(400).send({
                type: 'error',
                message : 'the id provided is not a valid id'
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error)
    }
});

module.exports = app;
