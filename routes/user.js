const express=require('express');
const router=express.Router()
const{signup,login,logout,forgotPassword,resetPassword,getLoggedInUserDetails,ChangePassword,adminAllusers}=require('../controllers/userController');
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
// isLoggedIn middleware is being injected
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails);
// update password route
router.route("/password/update").put(isLoggedIn,ChangePassword);
// check role route
router.route("/adminAllusers").get(isLoggedIn,isCustomRole('manager'),adminAllusers);

module.exports=router;