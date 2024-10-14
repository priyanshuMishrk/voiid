const express = require('express');
const User = require('../../models/user.model');
const connectDB = require('../../db');
const { createValidator } = require('express-joi-validation');
const { userSchema } = require('../../joi/user.joi')
const encryptor = require('../../Utils/Pass')
const tokenGenerator = require('../../Utils/Authorization')

connectDB()

const app = express();
const validator = createValidator();

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: Chatrooms
 *     description: Operations related to Chatrooms.

 * /chats:
 *   post:
 *     tags: 
 *      - Chatrooms
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
 *                 required: true
 *                 type: enum
 *                 description: the type of chatroom this key tells if its a group chat or a personal chat possible values [private, group]
 *                 example: private
 *               participants:
 *                 required: true
 *                 type: array
 *                 description: this key will have an array as value consisting ids of all other user in that particular room (important don't include the current user's id as that will be taken from header).
 *                 example: [66e927d41bf19fcac400a97a , 66e9293abe5773da13505932]
 *               group_name:
 *                 required: false
 *                 type: string
 *                 description: Only to be sent when starting group chat this will consists the title of group chat.
 *                 example: Walkers
 *               group_image:
 *                 required: false
 *                 type: string
 *                 description: Only to be sent when starting group chat this will consists the image of group chat.
 *                 example: url of image
 *     responses:
 *       201:
 *         description: Chat room created successfully will return all data of chatroom.
 *       400:
 *         description: Invalid input, object invalid.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       500:
 *         description: Server error.
 */

// Example route to find a user
app.post('/chats', tokenGenerator.authorizationToken , async (req, res) => {

    try {
        const {
            type,
            participants,
            group_name,
            group_image
        } = req.body

        if (type === 'private' && participants.length > 2){
            res.send('The chatroom consists multiple user but the chatroom is set a private')
        }

        const data = {
            type,
            participants,
            group_image,
            group_name
        };

        // Check for existing username
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                message: 'Username already exists.'
            });
        }

        // Check for existing email or phone number
        const existingEmailOrPhone = await User.findOne({
            $or: [
                { mail },
                { phNo }
            ]
        });
        if (existingEmailOrPhone) {
            return res.status(400).json({
                message: 'Email or phone number already exists.'
            });
        }

        const newArr = []

        newArr.push(data)

        const user = await User.insertMany(newArr)
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const responseData = {
            id : user[0].id,
            username: user[0].username,
            mail : user[0].mail,
            phNo:  user[0].phNo,
            about: user[0].about,
            img : user[0].img
        }

        const dataToken = {
            id : user[0].id,
            username: user[0].username,
            mail : user[0].mail,
            phNo:  user[0].phNo,
        }

        const token = await tokenGenerator.authenticationToken(dataToken)


        res.json({ ...responseData , token});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
        console.log(error)
    }
});

module.exports = app;
