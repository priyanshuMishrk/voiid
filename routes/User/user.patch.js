const express = require('express');
const User = require('../../models/user.model');
const connectDB = require('../../db');
const { createValidator } = require('express-joi-validation');
const { isValidObjectId } = require('../../Utils/Mongoose');
const userSchema = require('../../joi/user.joi')
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
 * components:
 *   securitySchemes:
 *       bearerAuth:     
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT

 * /users:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     summary: Edits user details by id but only edits about, username , img
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 required: false
 *                 type: string
 *                 description: The user's name.
 *                 example: John Doe
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
 * 
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
app.patch('/users', validator.body(userSchema.userPatchSchema), tokenGenerator.authorizationToken , async (req, res) => {
    const go = isValidObjectId(req.user.id)
    // console.log(req)
    // return res.send()
    try {

        if (go){

            const {
                username,
                about,
                img
            } = req.body
            const user = await User.findById(req.user.id);
            console.log(user)
            if (!user) {
            res.status(404).json({ message: 'User not found' });
            }
    
            if (username && username !== ''){
                user.username = username
            }
    
            if (about && about !== ''){
                user.about = about
            }
    
            if (img && img !== ''){
                user.img = img
            }
    
            const updateUser = await User.updateOne({
                    _id : req.user.id
            }, {
                $set : user
            })
            res.json({user, operationDetail : updateUser});
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
