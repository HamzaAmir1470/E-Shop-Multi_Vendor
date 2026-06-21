const express = require('express');
const app = express();
const ErrorHandler = require('./middlewares/error');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv'); // 1. Moved Up

// config - 2. Load environmental variables early
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: './config/.env'
  });
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sultanf.vercel.app",
  "http://13.53.174.206"    //aws ip address
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Note: You can keep this static path if you still host local files, 
// but Cloudinary will replace the need for local uploads.
app.use("/", express.static(path.join(__dirname, "./uploads")));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

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

// Base endpoints
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// Error Handler
app.use(ErrorHandler);

module.exports = app;