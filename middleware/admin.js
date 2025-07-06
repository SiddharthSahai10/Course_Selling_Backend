const jwt= require("jsonwebtoken");
const{ JWT_SECRET_ADMIN }= require("../config")

function adminMiddleware(req,res,next){
    const token=  req.headers.token;
    const decoded= jwt.verify(token, JWT_SECRET_ADMIN)
    if(decoded){
        req.userId= decoded.id;
        next()
    }else{
        res.status(403).json({
            message:"hattt"
        })
    }
}

module.exports={
    adminMiddleware:adminMiddleware
}