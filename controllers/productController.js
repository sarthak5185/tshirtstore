const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
exports.home = BigPromise(async (req, res) => {
    // const db = await something()
    res.status(200).json({
      success: true,
      greeting: "Hello from PRODUCT API",
    });
  });