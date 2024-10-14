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

 * /users/username/{name}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get a user by ID
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





/**
 * @swagger
 * /users/username/{name}:
 *   get:
 *     tags:
 *       - User
 *     summary: returns true or false if username is already taken or not
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The user name
 *     responses:
 *       200:
 *         description: an object with key exists consisting the boolean value if username already exists or not
 *       500:
 *         description: Server error
 *       400: 
 *          description: message provides the key of request body which has issuers
 */


// Example route to find a user
app.get('/users/username/:name', async (req, res) => {
    const nameU = req.params.name
    console.log(nameU, 'kskskksks')
    try {
        if (nameU) {
            const user = await User.find({
                username : nameU
            });
            if (user.length > 0) {
                return res.json({
                   exists : true
                });
            } else {
                return res.json({
                    exists : false
                })
            }
        } else {
            return res.status(400).send({
                type: 'error',
                message: 'the id provided is not a valid id'
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error)
    }
});

module.exports = app;
