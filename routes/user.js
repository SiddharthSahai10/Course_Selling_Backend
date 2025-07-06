const {Router}= require('express')
const userRouter= Router()
const userModel = require ("../db")
const jwt = require('jsonwebtoken');
const{z} = require("zod")
const bcrypt = require('bcrypt');
const {JWT_SECRET_USER} = require("../config");
const { userMiddleware } = require('../middleware/user');


userRouter.post("/signup", async function (req,res){
    const requiredbody=z.object({
          email:z.string().min(5).max(40).email(),
          firstName: z.string(),
          lastName: z.string(),
          password:z.string()
      })
      const parsedDataWithSuccess= requiredbody.safeParse(req.body)

       if(!parsedDataWithSuccess){
        res.json({
            message:"incorrect format"
        })
    }

    try{
        const hashedPassword=await bcrypt.hash(password,5);
        await userModel.create({
            email:email,
            password: hashedPassword,
            firstName:firstName,
            lastName: lastName
        })
 } catch(e){
        res.json({
            message:"errror while putting data"
        })
    }
    res.json({
        message:"signup done bro shree"
    })
})


userRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ 
        email: email,
        password:password
    });

    if (!user) {
        res.status(403).json({ message: "User does not exist" });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET_USER);
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials" });
    }
});


userRouter.get("/purchases", userMiddleware,   async function (req,res){
const userId=req.userId;
 const purchases=await purchaseModel.find({
    userId
   
 })
 const coursesData= await userModel.courseModel.find({
    _id: { $in: purchases.map(x=> x.courseId)} 
 })
    res.json({
      purchases
    })
} )

module.exports={
    userRouter: userRouter
}