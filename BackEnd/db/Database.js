const mongoose = require("mongoose");

const connectDatabase = () => {
    if (!process.env.DB_URL) {
        console.error("ERROR: DB_URL is not defined in environment variables.");
        return;
    }

    mongoose.connect(process.env.DB_URL) 
    .then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
};

module.exports = connectDatabase;