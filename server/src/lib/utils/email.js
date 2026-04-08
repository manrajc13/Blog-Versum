import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Email Verification OTP",
        html: `
            <h2>Your verification OTP</h2>
            <h1>${otp}</h1>
            <p>This OTP expires in 10 minutes.</p>
        `
    });

};