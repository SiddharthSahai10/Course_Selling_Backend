const {Router}= require("express")
const adminRouter= Router()
const {adminModel, courseModel}= require("../db")
const jwt = require('jsonwebtoken');
const{z} = require("zod")
const bcrypt = require('bcrypt');
const {JWT_SECRET_ADMIN} = require("../config");
const { adminMiddleware } = require("../middleware/admin");

adminRouter.post("/signup", async function(req,res){
    const requiredbody = z.object({
        email: z.string().min(5).max(40).email(),
        firstName: z.string(),
        lastName: z.string(),
        password: z.string()
    });

    const parsedData = requiredbody.safeParse(req.body);

    if (!parsedData.success) {
        return res.json({
            message: "incorrect format"
        });
    }

    const { email, firstName, lastName, password } = parsedData.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 5);
        await adminModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        });

        return res.json({
            message: "signup done bro shree"
        });
    } catch (e) {
        return res.json({
            message: "error while putting data"
        });
    }
});

adminRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body;

    const user = await adminModel.findOne({ 
        email: email
        
    });

    if (!user) {
      return  res.status(403).json({ message: "Admin does not exist" });
       
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET_ADMIN);
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials" });
    }
});

adminRouter.post("/course", adminMiddleware, async function(req,res){
    const adminId=req.userId;
    const{title, description, imageurl, price}= req.body;
 const course= await courseModel.create({
    title: title,
     description:description,
      imageurl: imageurl,
       price: price, 
    creatorId:adminId
 })




    res.json({
        message:"course created",
        courseId: course._id
    })
})
adminRouter.put("/course", adminMiddleware, async function(req,res){
  const adminId=req.userId;
    const{title, description, imageurl, price, courseId}= req.body;
 const course= await courseModel.updateOne({
    _id: courseId,
    creatorId:adminId // same creators shall update their courses. this checks the course id belongs to that admin   
 },{
    title: title,
     description:description,
      imageurl: imageurl,
       price: price, 
 })


    res.json({
        message:"course updated"
    })
})
adminRouter.get("/course/bulk", adminMiddleware, async function(req,res){
const adminId= req.userId


const courses= await courseModel.find({
  
    creatorId:adminId //find all the courses for this creator
 })



    res.json({
        message:"courses of this creator",
        courses
    })
})

module.exports={
    adminRouter: adminRouter
}
