const express = require('express');
const app = express();
const dotenv = require('dotenv');
const ErrorHandler = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cors = require('cors');

// Middlewares
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));

// config
if (process.env.NODE_ENV !== 'PRODUCTION') {
    dotenv.config({ 
        path: './BackEnd/config/.env' 
    });
}

// Import routes
const user = require('./controllers/user');
app.use('/api/v2/user', user);

// Error Handler
app.use(ErrorHandler);

module.exports = app;