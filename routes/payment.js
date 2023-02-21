const express=require("express");
const router=express.Router();
const {
    sendStripeKey,
    captureStripePayment,
  } = require("../controllers/paymentController");
const {isLoggedIn,isCustomRole} = require("../middlewares/user");

router.route("/stripekey").get(sendStripeKey);
// router.route("/payment").post(isLoggedIn,captureStripePayment);
router.route("/checkout/payment").post(captureStripePayment);

module.exports=router;