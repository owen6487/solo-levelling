const nodemailer = require("nodemailer");
const dns = require("dns");
const dotenv = require("dotenv");
dotenv.config();

// Force Node.js to resolve DNS using IPv4 ONLY
// This fixes "ENETUNREACH" errors on Render and other cloud providers
// that don't support IPv6 connectivity to external SMTP servers
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendSMS = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending SMS:", error.message);
    }
};

module.exports = sendSMS;