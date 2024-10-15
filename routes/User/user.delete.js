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
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User
 *     summary: Delete a user by ID
 *     responses:
 *       200:
 *         description: The user is delete
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *       400: 
 *          description: message provides the key of request body which has issuers
 * 
 */

// Example route to find a user
app.delete('/users', tokenGenerator.authorizationToken , async (req, res) => {
    const go = isValidObjectId(req.user.id)
    console.log("hoho")
    try {
        if (go){
            const userInit = await User.findById(req.user.id)
            console.log(userInit)
            if (!userInit) {
                return res.status(404).json({type: 'error', message: 'User not found' });
            }
    
    
            const user = await User.deleteMany({_id : req.user.id});
            res.json(user);
        }else {
            return res.status(400).send({
                type: 'error',
                message : 'the id provided is not a valid id'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = app;
