

const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId



const User = new Schema({
    username: {type: String, unique:true},
    password: String
})

const Course = new Schema({
    course_name: String,
    course_price: Number,
    creatorID: ObjectId
})

const Purchase = new Schema({
    courseId: { type: ObjectId, ref: "courses" },
    userId: { type: ObjectId, ref: "users" }
})
Purchase.index({ courseId: 1, userId: 1 }, { unique: true })


const Admin = new Schema({
    admin_username: {type: String, unique:true},
    admin_password: String
})

const UserModel = mongoose.model("users",User)
const CourseModel = mongoose.model("courses",Course)
const PurchaseModel = mongoose.model("purchases",Purchase)
const AdminModel = mongoose.model("admins",Admin)


module.exports = {
    UserModel:UserModel,
    CourseModel:CourseModel,
    PurchaseModel:PurchaseModel,
    AdminModel:AdminModel
}