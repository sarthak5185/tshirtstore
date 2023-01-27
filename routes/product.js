const express=require('express');
const router=express.Router()
const{home}=require('../controllers/productController');
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
router.route("/product").get(home);
module.exports=router;