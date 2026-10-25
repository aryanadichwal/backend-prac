const { JWT_USER_SECRET } = require("../config")
const JWT = require("jsonwebtoken")

function user_auth(req, res, next){
    try{
        const decodedtoken = JWT.verify(req.headers.token, JWT_USER_SECRET)
        req.userID = decodedtoken.id
        next()
    } catch(e){
        res.status(403).json({ message: "Incorrect credentials" })
    }
}

module.exports = {
    user_auth
}