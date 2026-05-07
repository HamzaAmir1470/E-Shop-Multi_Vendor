const nodemailer = require('nodemailer');

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        secure: true,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    // 2. Add Error Handling
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw new Error("Email could not be sent.");
    }
};

module.exports = sendMail;