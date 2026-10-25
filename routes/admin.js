const JWT = require("jsonwebtoken")
const { JWT_ADMIN_SECRET } = require("../config")
const {z} = require("zod")
const bcrypt = require("bcrypt")
const { AdminModel, CourseModel } = require("../db")
const { Router } = require("express")
const adminRouter = Router()
const { admin_auth } = require("../middlewares/admin")


//SCHEMA
const adminSchema = z.object({
    admin_username: z.string().min(1).max(30),
    admin_password: z.string().min(3).max(20)
})

const courseSchema = z.object({
    course_name: z.string().min(1).max(30),
    course_price: z.number().min(5).max(10000)
})

const deletecourseSchema = z.object({
    courseID: z.string().regex(/^[0-9a-fA-F]{24}$/)
})

const updatecourseSchema = z.object({
    courseID: z.string().regex(/^[0-9a-fA-F]{24}$/),
    course_name: z.string().min(1).max(30),
    course_price: z.number().min(5).max(10000)
})



// ADMIN ROUTES
adminRouter.post("/signup",async (req,res)=>{
    const parsed = adminSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues
        })
    }
    try{
        const admin_username = parsed.data.admin_username
        const hashed_admin_password = await bcrypt.hash(parsed.data.admin_password, 3)

        await AdminModel.create({
            admin_username:admin_username,
            admin_password: hashed_admin_password
        })
        res.json({
            message: "Admin Account created"
        })
    } catch (e){
        res.status(400).json({
            message:"admin_username already taken"
        })
    }
})

adminRouter.post("/signin",async (req,res)=>{
     const parsed = adminSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errores: parsed.error.issues
        })
    }
    try{
        const admin_username = parsed.data.admin_username
        const admin_password = parsed.data.admin_password
        const user = await AdminModel.findOne({
            admin_username:admin_username
        })
        if(user){
            const admin_password_match = await bcrypt.compare(admin_password, user.admin_password)
            if(admin_password_match){
                const token = JWT.sign(({
                    id:user._id.toString()
                }), JWT_ADMIN_SECRET)
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
                message:"Admin not found"
            })
        }
        
    } catch(e){
       res.status(500).json({
            message: e
        })
    }
})

adminRouter.post("/create-course",admin_auth,async (req,res)=>{
    const parsed = courseSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errores: parsed.error.issues
        })
    }
    try{
        const adminID= req.userID
        const course_name = parsed.data.course_name
        const course_price = parsed.data.course_price
        await CourseModel.create({
            course_name:course_name,
            course_price:course_price,
            creatorID:adminID
        })
        res.json({
            message : "Course created"
        })
    }catch(e){
        res.json({
            Error: e
        })
    }
})

adminRouter.get("/courses",admin_auth ,async (req,res)=>{
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

adminRouter.put("/update-courses",admin_auth ,async (req,res)=>{
    const parsed = updatecourseSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errores: parsed.error.issues
        })
    }
    try{
        const adminID = req.userID
        const { courseID, course_name, course_price } = parsed.data
        const course = await CourseModel.updateOne({
            _id : courseID,
            creatorID:adminID
        },{
            course_name:course_name,
            course_price:course_price
        })
        if(course){
            res.json({
            Messsage:"Course updated",
            Course: courseID})
        } else {
            res.json({
                message: "No courses listed"
            })
        }
    }catch(e){
        res.status(400).json({
            message : "Something went wrong"
        })
        console.log(e)
    }
        
})

adminRouter.delete("/delete-course",admin_auth,async (req,res)=>{
    const parsed = deletecourseSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid input",
            errores: parsed.error.issues
        })
    }
    try{
        const courseID = parsed.data.courseID
        const result = await CourseModel.deleteOne({ _id: courseID })
        if (result.deletedCount !== 1) {
            return res.status(404).json({ message: "Course not found" })
        }
        res.json({message:"Course Deleted"})
    } catch(e){
        res.status(500).json({message:"Something went wrong"})
        console.log(e)
    }
    
})


module.exports = {
    adminRouter:adminRouter
}