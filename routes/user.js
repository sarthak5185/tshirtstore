const express=require('express');
const router=express.Router()
const{signup,login,logout,forgotPassword,resetPassword,getLoggedInUserDetails,ChangePassword,adminAllusers,managerAllusers}=require('../controllers/userController');
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
// check admin role route
router.route("/admin/users").get(isLoggedIn,isCustomRole('admin'),adminAllusers);
// manager only routes
router.route("/admin/manager").get(isLoggedIn,isCustomRole('manager'),managerAllusers);

module.exports=router;