const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const Product=require("../models/product");
const cloudinary=require("cloudinary")
const WhereClause = require("../utils/whereClause");
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