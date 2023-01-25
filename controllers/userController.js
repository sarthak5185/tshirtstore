const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const crypto = require("crypto");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
/******************************************************
 * @SIGNUP
 * @route http://localhost:4000/api/v1/signup
 * @description User signUp Controller for creating new user
 * @parameters name, email, password
 * @returns  User Object and a make a cookie containing token value and user object
 ******************************************************/
exports.signup = BigPromise(async (req, res, next) => {
    
    let result;
    if(req.files)
    {
      let file=req.files.photo;
      // upload the files in cloudinary and give back result object containing id and secure url
      result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale",
      });
    }
    console.log(result);
   
    const { name, email, password } = req.body;
  
    if (!email || !name || !password) {
      return next(new CustomError("Name, email and password are required", 400));
    }
    // name,email,password,unique photoid and secureurl from cloudinary is extracted
    const user = await User.create({
      name,
      email,
      password,
      photo: {
        id: result.public_id,
        secure_url: result.secure_url,
      },
    });
    cookieToken(user, res);
  });

  /******************************************************
 * @LOGIN
 * @route http://localhost:4000/api/v1/login
 * @description User signIn Controller for loging new user
 * @parameters  email, password
 * @returns User Object
 ******************************************************/
  exports.login = BigPromise(async (req, res, next) => {
    //let result;
    // 1.GET EMAIL AND PASSWORD FROM USER
    // 2.CHECK IF USER EXISTS AND SELECT PASSWORD
    //3.CHECK IF THE PASSOWRD IS CORRECT USING METHOD IN OUR SCHEMA
    //4.CREATE A COOKIE CONSISTING OF TOKEN,USER AND EXPIRY AND SEND THAT COOKIE
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
  /******************************************************
 * @LOGOUT
 * @route http://localhost:4000/api/v1/logout
 * @description User logout bby clearing user cookies
 * @parameters  
 * @returns success message
 ******************************************************/
  exports.logout=BigPromise(async(req,res,next)=>{
    res.clearCookie('token');
    res.status(200).json({
      success:true,
      message:"LOGOUT SUCCESSFULL",
    })
  })