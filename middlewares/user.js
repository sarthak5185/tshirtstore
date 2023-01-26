const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");
//1.GET DECODED TOKEN FROM COOKIE
//2.IF TOKEN NOT FIND FIND FROM HEADER WHHERE IT EXISITS AS KEY VALUE PAIR  Authorization  Bearer  
//3.GET DECODED INFORMATION FROM TOKEN USING A SECRET
//4.DECODED INFO HAS A ID QUERY THE DB USING THAT ID
//5.ATTACH THE USER FOUND IN DB TO NEW PARAMAS OF USER WHICH IS REQ.USER
exports.isLoggedIn=BigPromise(async(req,res,next)=>{
    const token=req.cookies.token;
    if (!token && req.header("Authorization")) {
        token = req.header("Authorization").replace("Bearer ", "");
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id);
    next();
});