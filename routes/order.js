const express = require("express");
const {isLoggedIn,isCustomRole}=require('../middlewares/user');
const {createOrder,getOneOrder,getLoggedInOrders,admingetAllOrders,adminUpdateOrders,adminDeleteOrder}=require("../controllers/orderController");
const router = express.Router();

router.route("/order/create").post(isLoggedIn,createOrder);
router.route("/order/:id").get(isLoggedIn,getOneOrder);
router.route("/myorder").get(isLoggedIn,getLoggedInOrders);

// ADMIN ROUTES
router.route("/admin/orders").get(isLoggedIn,isCustomRole('admin'),admingetAllOrders);
router
.route("/admin/order:id")
.post(isLoggedIn,isCustomRole('admin'),adminUpdateOrders)
.delete(isLoggedIn,isCustomRole('admin'),adminDeleteOrder);

module.exports=router;