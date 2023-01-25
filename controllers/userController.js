const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const crypto = require("crypto");
const cookieToken = require("../utils/cookieToken");

/******************************************************
 * @SIGNUP
 * @route http://localhost:4000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @parameters name, email, password
 * @returns  User Object and a make a cookie containing token value and user object
 ******************************************************/
exports.signup = BigPromise(async (req, res, next) => {
    //let result;
    console.log(req.body);
   
    const { name, email, password } = req.body;
  
    if (!email || !name || !password) {
      return next(new CustomError("Name, email and password are required", 400));
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    cookieToken(user, res);
  });
  exports.login = BigPromise(async (req, res, next) => {
    //let result;
    const {email, password } = req.body;
  
    if (!email || !password) {
      return next(new CustomError("Name, email and password are required", 400));
    }
    const user=await User.findOne({email}).select("+password");
    if(!user)
    {
        return next(new CustomError('NOT REGISTERED IN DATABASE',400));
    }
    const isPasswordCorrect=await user.isValidatedPassword(password);
    if(!isPasswordCorrect)
    {
        return next(new CustomError('EMAIL OR PASSWORD DOES NOT EXIST',400));
    }
    cookieToken(user, res);
  });
  exports.logout=BigPromise(async(req,res,next)=>{
    res.clearCookie('token');
    res.status(200).json({
      success:true,
      message:"LOGOUT SUCCESSFULL",
    })
  })