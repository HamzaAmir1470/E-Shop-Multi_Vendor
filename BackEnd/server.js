
const dotenv = require('dotenv');

// connfig
if (process.env.NODE_ENV !== 'PRODUCTION') {
    dotenv.config({
        path: './config/.env'
    });
}

const connectDatabase = require("./db/Database");
const app = require("./app");

// connecting to database
connectDatabase();

// handling uncaught exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

// create server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    server.close(() => {
        process.exit(1);
    });
});