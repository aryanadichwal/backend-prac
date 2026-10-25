const JWT = require("jsonwebtoken")
const { JWT_USER_SECRET } = require("../config")
const {z} = require("zod")
const bcrypt = require("bcrypt")
const { UserModel, PurchaseModel, CourseModel } = require("../db")
const { Router } = require("express")
const userRouter = Router()
const { user_auth } = require("../middlewares/user")


//SCHEMA
const userSchema = z.object({
    username: z.string().min(1).max(30),
    password: z.string().min(3).max(20)
})

const purchaseSchema = z.object({
    courseID: z.string().regex(/^[0-9a-fA-F]{24}$/)
})

// USER ROUTES
userRouter.post("/signup", async (req,res)=>{
    const parsed = userSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues
        })
    }
    try{
        const username = parsed.data.username
        const hashed_password = await bcrypt.hash(parsed.data.password, 3)

        await UserModel.create({
            username:username,
            password: hashed_password
        })
        res.json({
            message: "Account created"
        })
    } catch (e){
        res.status(400).json({
            message:"Username already taken"
        })
    }
})

userRouter.post("/signin",async (req,res)=>{
    const parsed = userSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errores: parsed.error.issues
        })
    }
    try{
        const username = parsed.data.username
        const password = parsed.data.password
        const user = await UserModel.findOne({
            username:username
        })
        if(user){
            const password_match = await bcrypt.compare(password, user.password)
            if(password_match){
                const token = JWT.sign(({
                    id:user._id.toString()
                }), JWT_USER_SECRET)
                res.json({
                token:token
                })
            } else {
                res.status(403).json({
                message:"Invalid credentials"
                })
            }
        } else {
            res.status(403).json({
                message:"User not found"
            })
        }
        
    } catch(e){
        res.status(500).json({
            message: e
        })
    }
})

userRouter.get("/courses",user_auth ,async (req,res)=>{
    try{
        const courses = await CourseModel.find({}).select("course_name course_price")
        if(courses){
            res.json({
            courses})
        } else {
            res.json({
                message: "No courses listed"
            })
        }
        }catch(e){
            res.status(400).json({
                message : e
            })
        }
        
})

userRouter.get("/preview",user_auth ,async (req,res)=>{
    try{
        const courses = await CourseModel.find({}).select("course_name course_price")
        if(courses){
            res.json({
            courses})
        } else {
            res.json({
                message: "No courses listed"
            })
        }
        }catch(e){
            res.status(400).json({
                message : "Something went wrong"
            })
        }
        
})

userRouter.post("/purchase-course",user_auth,async (req,res)=>{
    const parsed = purchaseSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errores: parsed.error.issues
        })
    }
    try{
        const courseID = parsed.data.courseID
        const course = await CourseModel.findById(courseID)
        if(!course){
            res.status(404).json({
                message:"Course not found"
            })
        } else {
            await PurchaseModel.create({
                courseId: courseID,
                userId: req.userID  
            })
            res.json({
                message:"Course purchased"
            })
        }
    } catch(e){
        if (e.code === 11000) {
            return res.status(409).json({ message: "You already purchased this course" })
        }
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
})

userRouter.get("/purchased-course",user_auth, async(req,res)=>{
    try {
        const purchased = await PurchaseModel.find({ userId: req.userID }).select("courseId -_id").populate("courseId", "course_name -_id")
            if(purchased.length === 0){
                res.json({message:"You haven't purchased any course"})
            }else{
                res.json(purchased)
            }
        }catch(e){
            res.status(500).json({message:"Something went wrong"})
        }

})


module.exports = {
    userRouter:userRouter
}