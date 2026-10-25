const { JWT_ADMIN_SECRET } = require("../config")
const JWT = require("jsonwebtoken")

function admin_auth(req, res, next){
    try{
        const decodedtoken = JWT.verify(req.headers.token, JWT_ADMIN_SECRET)
        req.userID = decodedtoken.id
        next()
    } catch(e){
        res.status(403).json({ message: "Incorrect credentials" })
    }
}

module.exports = {
    admin_auth
}