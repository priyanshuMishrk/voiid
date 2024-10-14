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

 * /users/login/{type}:
 *   post:
 *     tags: 
 *      - User
 *     summary: (LOGIN API) (the request body should have only one of the keys among username , mail , phNo  Having atleast one of the is important)
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: in type send the type of login user is using only three possible values here [ ph (if using phone number) , em (if using email) , us (if using username) ]
 *     description: this endpoint is to be used while logging in
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
 *                 description: The user's username don't include spaces only single word.
 *                 example: John
 *               mail:
 *                 required: false
 *                 type: string
 *                 description: The user's email.
 *                 example: john@example.com
 *               pass:
 *                 required: true
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *               phNo:
 *                 required: false
 *                 type: string
 *                 description: The user's phone number.
 *                 example: +916351833668
 *     responses:
 *       200:
 *         description: User logged in successfully.
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
app.post('/users/login/:type', async (req, res) => {
    const go = req.params.type
    if (go !== 'us' && go !== 'em' && go !== 'ph'){
        return res.status(400).send('type undefine in params')
    }
    console.log(97 , go)
    try {
        const {
            username,
            mail,
            phNo,
            pass
        } = req.body

        if (!username || username === '' ){
            if (go === 'us'){
                return res.send('username not provided')
            }
        }

        if (!mail || mail === '' ){
            if (go === 'em'){
                return res.send('email not provided')
            }
        }

        if (!phNo || phNo === '' ){
            if (go === 'ph'){
                return res.send('phone number not provided')
            }
        }

        if (!pass || pass ===''){
            return res.send('password not provide')
        }

        const searchData = {

        }

        if (username && go === 'us'){
            searchData.username = username
        } else if (mail && go === 'em'){
            searchData.mail = mail
        }else if (phNo && go === 'ph'){
            searchData.phNo = phNo
        }

        console.log(140, searchData)
        const userData = await User.findOne({
           ...searchData
        })

        console.log(145 , userData)
        if (!userData) {
            return res.status(400).json({
                message: 'User doeesn\'t exists.'
            });
        }

        
        const hasshedd = userData.pass
        
        console.log(155, hasshedd)
        const passMatch = encryptor.comparePassword(pass,hasshedd)
        
        if (passMatch){
            const bodyData = {
                id : userData.id,
                username: userData.username,
                mail : userData.mail,
                phNo:  userData.phNo,
            }

            const responseData = {
                id : userData.id,
                username: userData.username,
                mail : userData.mail,
                phNo:  userData.phNo,
                about: userData.about,
                img : userData.img
            }

            const token = await tokenGenerator.authenticationToken(bodyData)
            
            res.json({ ...responseData , token});
        } else {
            res.send('Password Not Matching')
        }
    


    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
        console.log(error)
    }
});

module.exports = app;
