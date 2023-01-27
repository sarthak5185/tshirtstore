const express = require("express");
require("dotenv").config();
const app = express();
var cors = require('cors')

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//cookies and file middleware
app.use(cookieParser());

//FILE UPLOAD MIDDLEWARE SET USETEMPFILES AND SPECIFY THE DIRECTORY
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
// temp check
app.set("view engine","ejs");
//morgan middleware
app.use(morgan("tiny"));

//import all routes
const home=require("./routes/home");
const user=require("./routes/user");
const product=require("./routes/product");


// router middleware
app.use("/api/v1",home);
app.use("/api/v1",user);
app.use("/api/v1",product);



app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});
//export app.js
module.exports=app;