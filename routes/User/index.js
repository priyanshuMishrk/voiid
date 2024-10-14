const userApp = require('./user.get')
const userPost = require('./user.post')
const userDelete = require('./user.delete')
const userPatch = require('./user.patch')
const userName = require('./username.check')
const userLogin = require('./user.login')
const userProfo = require('./user.profile')
const array = [
    userApp,
    userPost,
    userDelete,
    userPatch,
    userName,
    userLogin,
    userProfo
]

module.exports = array