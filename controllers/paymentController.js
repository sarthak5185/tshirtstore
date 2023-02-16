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

// exports.captureStripePayment = BigPromise(async (req, res, next) => {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: req.body.amount,
//     currency: "inr",
//     metadata: { integration_check: "accept_a_payment" },
//   });

//   res.status(200).json({
//     success: true,
//     amount: req.body.amount,
//     client_secret: paymentIntent.client_secret,
//     //you can optionally send id as well
//   });
// });
// exports.captureStripePayment =(async (req, res) => {
//   stripe.charges.create(
//     {
//       source: req.body.tokenId,
//       amount: req.body.amount,
//       currency: "usd",
//     },
//     (stripeErr, stripeRes) => {
//       if (stripeErr) {
//         res.status(500).json(stripeErr);
//       } else {
//         res.status(200).json(stripeRes);
//       }
//     }
//   );
// });
// exports.captureStripePayment = BigPromise(async (req, res, next) => {
//     const {product,token}=req.body;
//     console.log("Product",product);
//     console.log("Price",product.price);
//     const idempotenceyKey=uuid();
//     return stripe.customers.create({
//       email:token.email,
//       source:token.id
//     }).then(customer=>{
//       stripe.charges.create({
//         amount:product.price*100,
//         currency:usd,
//         customer:customer.id,
//         receipt_email:token.email,
//         description:product.name,
//         shipping:{
//             name:token.card.name,
//             address:{
//               country:token.card.address_country
//             }
//         }
//       },{idempotenceyKey})
//     })
//     .then(result=>res.status(200).json(result))
//     .catch(err=>console.log(err));
// })
exports.captureStripePayment = BigPromise(async (req, res, next) => {
  console.log(`AMOUNT IS :${req.body.amount}`);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    payment_method: req.body.id,
    confirm:true,
     //optional
     metadata: { integration_check: "accept_a_payment" },
  });
  console.log("stripe-routes.js 19 | payment", paymentIntent);
  res.status(200).json({
    success: true,
    amount: req.body.amount,
    client_secret: paymentIntent.client_secret,
    //you can optionally send id as well
  });
});

