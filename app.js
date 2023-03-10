const express= require("express");
require("dotenv").config();
const app = express();
var cors = require('cors')
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.static(process.env.STATIC_DIR));


//cookies and file middleware
app.use(cookieParser());
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

module.exports=app;