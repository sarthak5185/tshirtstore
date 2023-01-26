const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const crypto = require("crypto");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailhelper");
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

  /******************************************************
 * @FORGOT_PASSWORD
 * @route http://localhost:4000/api/v1/forgotPassword
 * @description User will submit email and we will generate a token
 * @parameters  email
 * @returns success message - email send
 ******************************************************/
//1.GRAB THE EMAIL
//2.SEARCH FOR USER IN DATABASE USING THE EMAIL
//3.IF NO USER FOUND THROW AN ERROR
//4.GET FORGET PASSWORD TOKEN FROM USER.GETFORGOTPASSWORDTOKEN
//5.SAVE THIS TOKEN IN DATABASE USING await user.save({validateBeforeSave:false}) as we wish to save only token
//6.GENRATE FUTURE PROOF URL OF RESET FROM PROTOCOL AND HOST
//7.SEND THE MAIL TO USER WITH MAILHELPER 
//8. IF MAIL FAILS BACKTRACK THE FORGETPASSWORDTOKEN AND EXPIRY AND SET THEM TO NULL BACK AGAIN
exports.forgotPassword=BigPromise(async(req,res,next)=>{
  const {email}=req.body;
  console.log(email);
  const user=await User.findOne({email});
  if(!user)
  {
      return next(new CustomError('NOT REGISTERED IN DATABASE',400));
  }
  const forgetpasswordtoken=await user.getForgotPasswordToken();

  await user.save({validateBeforeSave:false});

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgetpasswordtoken}`;
    
  const message=`Copy paste this link in your URL and hit enter \n\n ${myUrl}`;;
  console.log(message);
  try
  {
    await mailHelper({
      email:user.email,
      subject:"LCO TSHIRT STORE PASSWD RESET MAIL",
      message,
    });
    res.status(200).json({
      success:true,
      message:`Email send to ${user.email}`
    })
  }
  catch(error)
  {
      user.forgotPasswordExpiry=undefined;
      user.forgotPasswordToken=undefined;
      await user.save({validateBeforeSave:false});
      throw new CustomError(error.message || 'Email sent failure', 500)
  }
})

 /******************************************************
 * @RESET_PASSWORD
 * @route http://localhost:4000/api/v1/password/reset/:resetToken
 * @description User will be able to reset password based on url token
 * @parameters  token from url, password and confirmpass
 * @returns none
 ******************************************************/
//get token from params
// hash the token as db also stores the hashed version
// find user based on hased on token and time in future
// check if password and conf password matched
// update password field in DB
// reset token fields
// save the user
exports.resetPassword=BigPromise(async(req,res,next)=>{
    const token=req.params.token;
    const hashtokenec=crypto.createHash("sha256").update(token).digest("hex");
    const user=await User.findOne({
      hashtokenec,
      forgotPasswordExpiry:{$gt:Date.now()},
    });
    if(!user)
    {
      return next(new CustomError("EXPIRED TOKEN", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
      return next(
        new CustomError("password and confirm password do not match", 400)
      );
    }
    // update password field in DB
    user.password=req.body.password;
    // reset token fields
    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken=undefined;

    // save the user
    await user.save();
    cookieToken(user,res);
})
 /******************************************************
 * @LoggedInUserDetails
 * @route http://localhost:4000/api/v1/userdashboard
 * @description User will be able to fetch his detals
 * @parameters  none
 * @returns User object
 ******************************************************/
exports.getLoggedInUserDetails=BigPromise(async(req,res,next)=>{
  const id=req.user.id;
  const user=await User.findById(id);
  if(!user)
  {
    return next(new CustomError("USER NOT FOUND",400));
  }
  res.status(200).json({
    success:true,
    user,
  });
});





/******************************************************
 * @ChangePassword
 * @route http://localhost:4000/api/v1/password/update
 * @description User will be able to fetch his detals
 * @parameters oldPassword,password
 * @returns none
 ******************************************************/
//1.get user object from middleware
//2.get user from database
//3.check if old password is correct
//4.allow to set new Password
//5.save the user in databse
//6. make cookie for this
exports.ChangePassword=BigPromise(async(req,res,next)=>{
  const id=req.user.id;
  const user=await User.findById(id).select("+password");
  const isPasswordCorrect=await user.isValidatedPassword(req.body.oldPassword);
  if(!isPasswordCorrect)
  {
        return next(new CustomError('EMAIL OR PASSWORD DOES NOT EXIST',400));
  }
  user.password=req.body.password;
  await user.save();
  cookieToken(user, res);
});