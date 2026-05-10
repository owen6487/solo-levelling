const resend = require("resend");

const dotenv = require("dotenv");
dotenv.config();

const resendClient = new resend(process.env.RESEND_KEY);

const sendSMS = async (to, subject, text) => {
    try {
        await resendClient.emails.send({
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
