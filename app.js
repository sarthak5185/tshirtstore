const express= require("express");
require("dotenv").config();
const app = express();
var cors = require('cors')
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');

// Handlebars Middleware
app.engine('handlebars', engine({defaultLayout: "main"}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set Static Folder
app.use(express.static(`${__dirname}/public`));

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
//morgan middleware
app.use(morgan("tiny"));

//import all routes
const home=require("./routes/home");
const user=require("./routes/user");
const product=require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");

// router middleware
app.use("/api/v1",home);
app.use("/api/v1",user);
app.use("/api/v1",product);
app.use("/api/v1", order);
app.use("/api/v1",payment);

// app.get("/signuptest", (req, res) => {
//   res.render("signuptest");
// });

// Index Route
app.get('/', (req, res) => {
  res.render("index", {
    stripePublishableKey:process.env.STRIPE_API_KEY
  });
});
//export app.js
module.exports=app;