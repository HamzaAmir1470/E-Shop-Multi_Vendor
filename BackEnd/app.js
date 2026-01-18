const express = require('express');
const app = express();
const dotenv = require('dotenv');
const ErrorHandler = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({useTempFiles: true}));

// config
if (process.env.NODE_ENV !== 'PRODUCTION') {
    dotenv.config({ 
        path: './BackEnd/config/.env' 
    });
}

// Error Handler
app.use(ErrorHandler);

module.exports = app;