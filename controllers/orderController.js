const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
/******************************************************
 * @CREATE ORDER
 * @route http://localhost:4000/api/v1/order/create
 * @description User signUp Controller for creating new user
 * @parameters  shippingInfo,orderItems,paymentInfo,taxAmount,shippingAmount,totalAmount,
 * @returns  order object and success
 ******************************************************/
exports.createOrder = BigPromise(async (req, res, next) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
    } = req.body;
  
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
      user: req.user._id,
    });
  
    res.status(200).json({
      success: true,
      order,
    });
  });
/******************************************************
 * @GET ONE ORDER
 * @route http://localhost:4000/api/v1/order/:id
 * @description 
 * @parameters  shippingInfo,orderItems,paymentInfo,taxAmount,shippingAmount,totalAmount,
 * @params orderid
 * @returns  order object and success msg
 ******************************************************/
exports.getOneOrder = BigPromise(async (req, res, next) => {
    //TODO:populate would further drill down the user object and further grab the name and email from user schema
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new CustomError("please check order id", 401));
    }
  
    res.status(200).json({
      success: true,
      order,
    });
  });
/******************************************************
 * @GET LOOGED IN ORDERS
 * @route http://localhost:4000/api/v1/myorder
 * @description fetch all the orders of logged in user
 * @parameters  none
 * @params none
 * @returns  order object and success msg
 * 1.GET ALL THE ENTRIES INSIDE ORDER DATABASE WHERE USER MATCHES CURRENT USER YOU CAN USE WHERE FOR IT
 * 2. IF SUCCESFULLY FOUND RETURN ALL THAT PARTICULAR OBJECTS AND SUCCESS MESSAGE
 ******************************************************/
  exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
   const order= await Order.find({user: req.user._id});
   if(!order)
   {
        return new CustomError("please check order id",401);
   }
   res.status(200).json({
    success:true,
    order,
   });
  });

  exports.admingetAllOrders = BigPromise(async (req, res, next) => {
      const orders = await Order.find();

      res.status(200).json({
        success: true,
        orders,
      });
   });
   /******************************************************
 * @DELETE ADMINDELETEORDER
 * @route http://localhost:4000/api/v1/order/:id
 * @description update the order status and quantity in stock
 * @parameters  {orderStatus}
 * @params orderid
 * @returns success msg
 * 1.GET ALL THE ENTRIES INSIDE ORDER DATABASE WHERE ORDER ID MATCHES FROM THE DB
 * 2.DELTE THE ORDER
 * 2. IF SUCCESFULLY DELETED RETURN OBJECT CONTAING SUCCESS MESSAGE
 ******************************************************/
   exports.adminUpdateOrders = BigPromise(async (req, res, next) => {
      const id=req.params.id;
      const order=await Order.findById(id);
      if(order.orderStatus=="Delivered")
      {
        return new CustomError("already delivered",401);
      }
      order.orderStatus=req.body.orderStatus;
      order.orderItems.forEach(async prod=>{
        await updateProductStock(prod.product,prod.quantity)
      });
   });
   async function updateProductStock(productId,quantity)
   {
      const product=await Product.findById(productId);
      if(product.stock<quantity)
      {
        throw new CustomError("order can not be placed",402);
      }
      product.stock=product.stock-quantity;
      // imp TODO:validateBeforeSave to be turned off
      await product.save({
        validateBeforeSave:false,
      })
   }
   /******************************************************
 * @DELETE ADMINDELETEORDER
 * @route http://localhost:4000/api/v1/order/:id
 * @description delte order on the basis of orderid
 * @parameters  none
 * @params orderid
 * @returns success msg
 * 1.GET ALL THE ENTRIES INSIDE ORDER DATABASE WHERE ORDER ID MATCHES FROM THE DB
 * 2.DELTE THE ORDER
 * 2. IF SUCCESFULLY DELETED RETURN OBJECT CONTAING SUCCESS MESSAGE
 ******************************************************/
   exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    await order.remove();
  
    res.status(200).json({
      success: true,
    });
  });