const dotenv = require('dotenv');
const express = require('express');
const app = express();
const ErrorHandler = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cors = require('cors');

// Middlewares
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "./uploads")));

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== 'PRODUCTION') {
    dotenv.config({
        path: './config/.env'
    });
}

// Import routes
const user = require('./controllers/user');
const shop = require('./controllers/shop');
const product = require('./controllers/product');
const event = require('./controllers/event');
const coupoun = require('./controllers/coupounCode');
const payment = require('./controllers/payment');
const order = require('./controllers/order');
const conversation = require('./controllers/conversation');
const message = require('./controllers/message');
const withdraw = require('./controllers/withdraw');

// Route Middlewares
app.use('/api/v2/product', product);
app.use('/api/v2/user', user);
app.use('/api/v2/shop', shop);
app.use('/api/v2/event', event);
app.use('/api/v2/coupoun', coupoun);
app.use('/api/v2/payment', payment);
app.use('/api/v2/order', order);
app.use('/api/v2/conversation', conversation);
app.use('/api/v2/message', message);
app.use('/api/v2/withdraw', withdraw);

// Error Handler
app.use(ErrorHandler);

// health check
app.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy'
    });
});

module.exports = app;