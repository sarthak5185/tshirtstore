const express=require('express');
const router=express.Router()
const{home,addProduct}=require('../controllers/productController');
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
router.route("/product").get(home);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn,isCustomRole("admin"),addProduct);

module.exports=router;

