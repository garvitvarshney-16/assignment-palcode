import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config({ path: './.env' });

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    credentials: true,
}));

const otps = {};

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send("Email is required.");

    const otp = Math.floor(100000 + Math.random() * 900000);
    otps[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: "no-reply@example.com",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });
        res.send("OTP sent successfully.");
    } catch (err) {
        console.error("Error sending OTP:", err.message);
        res.status(500).send("Error sending OTP. Please try again later.");
    }
});

app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).send("Email and OTP are required.");
    }

    const record = otps[email];

    if (!record) {
        return res.status(400).send("No OTP found for this email.");
    }

    if (record.otp.toString() !== otp.toString()) {
        return res.status(400).send("Invalid OTP.");
    }

    if (Date.now() > record.expires) {
        delete otps[email]; // Remove expired OTP
        return res.status(400).send("OTP expired.");
    }

    delete otps[email];
    res.send("OTP verified successfully.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
