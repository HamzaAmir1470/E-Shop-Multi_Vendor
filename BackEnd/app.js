const dotenv = require('dotenv');
const express = require('express');
const app = express();
const ErrorHandler = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cors = require('cors');

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== 'PRODUCTION') {
    dotenv.config({
        path: './BackEnd/config/.env'
    });
}

// Import routes
const user = require('./controllers/user');
const shop = require('./controllers/shop');
const product = require('./controllers/product');
const event = require('./controllers/event');
const coupoun = require('./controllers/coupounCode');
const payment = require('./controllers/payment');

// Route Middlewares
app.use('/api/v2/product', product);
app.use('/api/v2/user', user);
app.use('/api/v2/shop', shop);
app.use('/api/v2/event', event);
app.use('/api/v2/coupoun', coupoun);
app.use('/api/v2/payment', payment);

// Error Handler
app.use(ErrorHandler);

module.exports = app;