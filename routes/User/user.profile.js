const express = require('express');
const User = require('../../models/user.model');
const connectDB = require('../../db');
const { isValidObjectId } = require('../../Utils/Mongoose');
const tokenGenerator = require('../../Utils/Authorization')


connectDB()

const app = express();

connectDB();

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Operations related to users.
 * components:
 *   securitySchemes:
 *       bearerAuth:     
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 * /users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     summary: Get a user by ID (only to be used when user is viewing its own profile)
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
app.get('/users', tokenGenerator.authorizationToken , async (req, res) => {
    const go = isValidObjectId(req.user.id)
    try {
        if (go){
            const user = await User.findById(req.user.id);
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
