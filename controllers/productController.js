const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const Product=require("../models/product");
const cloudinary=require("cloudinary")
const WhereClause = require("../utils/whereClause");
const product = require("../models/product");
exports.home = BigPromise(async (req, res) => {
    // const db = await something()
    res.status(200).json({
      success: true,
      greeting: "Hello from PRODUCT API",
    });
  });
  /******************************************************
 * @ADD PRODUCT
 * @route http://localhost:4000/api/v1/admin/product/add
 * @description USER SHALL BE ABLE TO ADD A PRODUCT
 * @parameters  NAME,PHOTO,PRICE,DESCRIPTION,BRAND,STOCK,CATEGORY
 * @returns  PRODUCT OBJECT 
 ******************************************************/
exports.addProduct=BigPromise(async(req,res)=>{
  // images
  const ndata={
    price:req.body.price,
    name:req.body.name,
    description:req.body.description,
    stock:req.body.stock,
    brand:req.body.brand,
    category:req.body.category,
  };
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }
  console.log("RESULT", req.files.photos[0]);

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      console.log("UPLOAD START...");
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      console.log("RESULT", result);
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  ndata.photos = imageArray;
  ndata.user=req.user.id;
  const product = await Product.create(ndata);

  res.status(200).json({
    success: true,
    product,
  });
});
  /******************************************************
 * @GET All Products
 * @route http://localhost:4000/api/v1/searcn=coder&page=2&category=shortsleaves&ratings[gte]=4&price[lte]=999&price[gte]=199
 * @description USER SHALL BE ABLE TO GET ALL PRODUCTS BASED ON THE QUERY
 * @params search,page,category,ratings,price
 * @returns object containing success message,products,filteredProductNumber,totalCountProduct,resultPerPage
 ******************************************************/
exports.getAllProduct=BigPromise(async(req,res)=>{
  let resultperPage=6;
  const totalcountproduct=await Product.countDocuments();

  const productsObj=new WhereClause(Product.find(),req.query)
  .search()
  .filter();

  let products=await productsObj.base;
  const filteredproductnumber=products.length;

  productsObj.pager(resultperPage);
  /*  WE USE A CLONE METHOD TO AVOID DUPLICATE QUERY EXECUTION
      product.limit(resultperpage).skip(skipval) */
  products=await productsObj.base.clone(); 

  res.status(200).json({
    success:true,
    products,
    filteredproductnumber,
    totalcountproduct,
    resultperPage
  });
});
  /******************************************************
 * @GET ONE PRODUCT
 * @route http://localhost:4000/api/v1/getOneProduct/productid
 * @description USER SHALL BE ABLE TO GET PRODUCT WITH A PARTICULAR ID
 * @params ID
 * @returns object containing success message,product
 ******************************************************/
  exports.getOneProduct=BigPromise(async(req,res,next)=>{
    let prod=await Product.findById(req.params.id);
    if (!prod) {
      return next(new CustomError("No product found with this id", 401));
    }
    res.status(200).json({
      success:true,
      prod,
    })
  });
   /******************************************************
 * @POST  ADD REVIEW
 * @route http://localhost:4000/api/v1/review
 * @description FRONTEND WILL SEND DETAILS LIKE RATING,COMMENT AND PRODUCTID AND USER SHALL BE ABLE TO ADD REVIEW
 * @params NONE
 * @returns object containing success
 ******************************************************/
  exports.addReview = BigPromise(async (req, res, next) => {
    const {rating,comment,productId}=req.body;
    const review={
      user:req.user._id,
      name:req.user.name,
      rating:Number(rating),
      comment,
    }
    const product = await Product.findById(productId);

    const AlreadyReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if(AlreadyReview)
    {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user._id.toString()) {
          review.comment = comment;
          review.rating = rating;
        }
      });
    }
    else
    {
        product.reviews.push(review)
        product.numberOfReviews=product.reviews.length
    }
    product.ratings =product.reviews.reduce((acc, item) => item.rating + acc, 0)/product.reviews.length;
    await product.save({
      validateBeforeSave:false,
    });
    res.status(200).json({
      success:true,
    });
  });

    /******************************************************
 * @DELETE DELETE REVIEW
 * @route http://localhost:4000/api/v1/review/:id
 * @description FRONTEND WILL SEND product id in params and the review of that particular user will be deleted
 * @params product id
 * @returns object containing success
 ******************************************************/
    //1.GET PRODUCT ID FROM PARAMS AND GET THAT PARTICULAR PRODUCT
    //2.FIND ALL THOSE  FILTERED OBJECTS WHERE ID IS NOT USERID 
    //3.UPDATE NUMBER OF REVIRWS WHICH IS LENGTH OF FILTERED ARRAY
    //4. UPDATE revies,numberofReviews and ratings in mongodb itself
    //5.UPDATE IN THE DATABSE
    //6. SEND A SUCCESS MESSAGE
    exports.deleteReview = BigPromise(async (req, res, next) => {
      const productId=req.params.id;
      const product=await Product.findById(productId);
      const narr = product.reviews.filter((rev) => rev.user.toString()!=req.user._id.toString());
      console.log(narr);
      product.reviews=narr;
      product.numberOfReviews=narr.length;
      product.ratings=narr.reduce((acc, item) => item.rating + acc, 0) / narr.length;
      await product.save({
        validateBeforeSave:false,
      });
      res.status(200).json({
        success:true,
      });
  });
  /******************************************************
 * @GET REVIEWS FOR ONE PRODUCT
 * @route http://localhost:4000/api/v1/adminGetAllProduct
 * @description USER WOULD BE ABLE TO SEE ALL REVIEWS WITH PARTICULAR PRODUCT ID
 * @params PRODUCT ID
 * @returns object containing success message,REVIEWS
 ******************************************************/
  exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });
/******************************************************
 * @GET admingetAllProduct
 * @route http://localhost:4000/api/v1/adminGetAllProduct
 * @description ADMIN SHALL BE ABLE TO GET ALL PRODUCTS
 * @params NONE
 * @returns object containing success message,products
 ******************************************************/
exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

/******************************************************
 * @PUT adminUpdateOneProduct
 * @route http://localhost:4000/api/v1/admin/product/id
 * @description ADMIN SHALL BE ABLE TO UPDATE PARTICULAR PRODUCT
 * @params ID
 * @returns object containing success message,products
 ******************************************************/
//1. FIND A PARTICULAR PRODUCT BY ITS ID
//2. IF PRODUCT DNE THROW AN ERROR
//3. DELETE THE OLD PHOTOS FROM CLOUDINARY
//4.SET THE PHOTOS ARRAY AND UPDATE THE ARRAY IN REQ
exports.adminUpdateOneProduct=BigPromise(async (req, res, next) => {
  let prod=await Product.findById(req.params.id);
  if(!prod)
  {
    return next(new CustomError("No product found with this id", 401));
  }
  let imageArray=[];
  if(req.files)
  {
    // destroying the old image
    for(let index=0;index<prod.photos.length;index++)
    {
        const res = await cloudinary.v2.uploader.destroy(
          prod.photos[index].id
        );
    }
    // uploading the new image
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products", //folder name -> .env
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }
  req.body.photos=imageArray;
  let product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});
/******************************************************
 * @DELETE adminDeleeOneProduct
 * @route http://localhost:4000/api/v1/admin/product/id
 * @description ADMIN SHALL BE ABLE TO DELETE PARTICULAR 
 * @params ID
 * @returns object containing success message,products
 ******************************************************/
exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id", 401));
  }

  //destroy the existing image
  for (let index = 0; index < product.photos.length; index++) {
    const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product was deleted !",
  });
});
