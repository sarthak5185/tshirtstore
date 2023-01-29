const express=require('express');
const router=express.Router()
const{home,addProduct,getAllProduct,getOneProduct,addReview,adminGetAllProduct,adminUpdateOneProduct,adminDeleteOneProduct}=require('../controllers/productController');
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
router.route("/product").get(home);

// USER ROUTES
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);
router.route("/review").post(isLoggedIn,addReview);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn,isCustomRole("admin"),addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn,isCustomRole("admin"),adminGetAllProduct);

  router
  .route("/admin/product/:id")
  .put(isLoggedIn,isCustomRole("admin"),adminUpdateOneProduct)
  .delete(isLoggedIn,isCustomRole("admin"),adminDeleteOneProduct)

module.exports=router;

