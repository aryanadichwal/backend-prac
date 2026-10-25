require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const dns = require("dns")
dns.setServers(["8.8.8.8", "1.1.1.1"])

const { userRouter } = require("./routes/user")
const { adminRouter } = require("./routes/admin")

const app = express()
app.use(express.json()) 

app.use("/user",userRouter)
app.use("/admin",adminRouter)

async function main(){
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(3006)
    console.log("listening on port 3006")

}

main()