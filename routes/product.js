const express=require('express');
const router=express.Router()
const{home,addProduct,getAllProduct,adminGetAllProduct,getOneProduct}=require('../controllers/productController');
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
router.route("/product").get(home);

// USER ROUTES
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn,isCustomRole("admin"),addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn,isCustomRole("admin"),adminGetAllProduct);



module.exports=router;

