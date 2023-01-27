const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const Product=require("../models/product");
const cloudinary=require("cloudinary")
exports.home = BigPromise(async (req, res) => {
    // const db = await something()
    res.status(200).json({
      success: true,
      greeting: "Hello from PRODUCT API",
    });
  });
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