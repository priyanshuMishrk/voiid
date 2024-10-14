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

connectDB();

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Operations related to users.

 * /users/signup:
 *   post:
 *     tags: 
 *      - User
 *     summary: Create a new user (SIGNUP API)
 *     description: This endpoint creates a new user with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 required: true
 *                 type: string
 *                 description: The user's username don't include spaces only single word.
 *                 example: John
 *               mail:
 *                 required: true
 *                 type: string
 *                 description: The user's email.
 *                 example: john@example.com
 *               pass:
 *                 required: true
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *               phNo:
 *                 required: true
 *                 type: string
 *                 description: The user's phone number.
 *                 example: +916351833668
 *               about:
 *                 required: false
 *                 type: string
 *                 description: The user's bio max limit 140 characters.
 *                 example: Hello my name is john, I am a worker at a university (max limit is 140 words).
 *               img:
 *                 required: false
 *                 type: string
 *                 description: The user's display profile URL.
 *                 example: url of his/her image.
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 mail:
 *                   type: string
 *                 phNo:
 *                   type: string
 *                 about:
 *                   type: string
 *                 img:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input, object invalid.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       500:
 *         description: Server error.
 */

// Example route to find a user
app.post('/users/signup', validator.body(userSchema), async (req, res) => {

    try {
        const {
            username,
            mail,
            pass,
            phNo,
            about,
            img
        } = req.body

        console.log('here reached nowhere else ')
        const newp = await encryptor.hashPassword(pass)
        console.log(newp)

        const data = {
            username,
            mail,
            pass: newp,
            phNo,
            about,
            img
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
