const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Order = require("../models/order");
const Product = require("../models/product");
const User=require("../models/user");


exports.sendStripeKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
      stripekey: process.env.STRIPE_API_KEY,
    });
  });
  
  exports.captureStripePayment = BigPromise(async (req, res, next) => {
   /**Capture info from frontend
     * productArray shoud have productId, count
     * phone Number should be in number
     */
   const {productArray, couponCode, address, phoneNumber} = req.body;
   const userId = req.user._id;

   // make query as variable
   let productQuery = [];
   productArray.map((item) => (
       productQuery.push(item.productId)
   ));
   
   //capture product price from backend
   const products = await Product.find({ "_id" : { "$in" : productQuery}});

   let totalAmount = 0 ;
   let productDetails = []

   products.map((item) => {
       productArray.map((count)=>{
           if(item._id == count.productId){
               totalAmount += (item.price)*(count.count);
               let newItem = {
                       productId: item._id,
                       count: count.count,
                       price: item.price
                   }
               productDetails.push(newItem);
           }
       })
   })
   let orderDetails= {
       user: userId,
       address,
       phoneNumber,
       amount: totalAmount,
       products: productDetails
   };
    let finalAmount = totalAmount;
    const paymentIntent = await stripe.paymentIntents.create({
      amount:totalAmount,
      currency: "inr",
      metadata:{ integration_check: "accept_a_payment"},
    });
    res.status(200).json({
      success: true,
      amount:totalAmount,
      client_secret: paymentIntent.client_secret,
    });

  });
  
 