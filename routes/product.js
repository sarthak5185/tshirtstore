const express=require('express');
const router=express.Router()
const{home,addProduct,getAllProduct}=require('../controllers/productController');
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
router.route("/product").get(home);

// USER ROUTES
router.route("/products").get(getAllProduct);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn,isCustomRole("admin"),addProduct);


module.exports=router;

