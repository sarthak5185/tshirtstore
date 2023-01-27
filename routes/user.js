const express=require('express');
const router=express.Router()
const{signup,login,logout,forgotPassword,resetPassword,getLoggedInUserDetails,ChangePassword,adminAllusers,managerAllusers,admingetOneUser
,updateUserDetails,adminUpdateOneUserDetails,adminDeleteOneUserDetails}=require('../controllers/userController');
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
router.route("/userdashboard/update").post(isLoggedIn,updateUserDetails);
// check admin role route
router.route("/admin/users").get(isLoggedIn,isCustomRole('admin'),adminAllusers);
router.
    route("/admin/user/:id")
    .get(isLoggedIn, isCustomRole("admin"), admingetOneUser)
    .put(isLoggedIn,isCustomRole("admin"),adminUpdateOneUserDetails)
    .post(isLoggedIn,isCustomRole("admin"),adminDeleteOneUserDetails)
// manager only routes
router.route("/manager/users").get(isLoggedIn,isCustomRole('manager'),managerAllusers);

module.exports=router;