import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken, { cookieBaseOptions } from "../lib/utils/token.js";
import { generateOTP } from "../lib/utils/otp.js";
import { sendOTPEmail } from "../lib/utils/email.js";
import cloudinary from "../lib/cloudinary.js";
import { assertImageOk, isHostedImageUrl } from "../lib/utils/imageUpload.js";


const getIdentifierQuery = (identifier) => {
    const normalized = String(identifier || "").trim();
    if (!normalized) return null;

    return {
        $or: [
            { username: normalized },
            { email: normalized.toLowerCase() }
        ]
    };
};


export const signup = async (req, res) => {
    const {username, email, password, fullname} = req.body;
    try{
        if (!username || !fullname || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }
        if (password.length < 8){
            return res.status(400).json({message: "Password must be at least 8 characters"});
        }
        const user = await User.findOne({email});
        if (user) return res.status(400).json({message: "Email already registered"});

        const userNameExists = await User.findOne({username});
        if (userNameExists) return res.status(400).json({message: "Username already taken"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            fullname: fullname,
            // avatar: avatar || "",
            // bio: bio || "",
            // interests: interests || [],
            // themePreference: themePreference || "ghibli",
            // colorPalette: colorPalette || "default"
        });

        if (newUser){
            await newUser.save();
            res.status(201).json({message: "Awaiting verification"});
        } else {
            res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Error in singup controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const login = async (req, res) => {
    const {username, password} = req.body;
    try{
        const identifierQuery = getIdentifierQuery(username);
        if (!identifierQuery) {
            return res.status(400).json({message: "Username or email is required"});
        }

        const user = await User.findOne(identifierQuery);

        if (!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid password"});
        }

        if (!user.isVerified){
            return res.status(403).json({message: "Account not verified. Please wait for verification.", email: user.email});
        }

        generateToken(user._id, res);
        
        res.status(200).json({
            _id: user._id,
            fullname: user.fullName,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            interests: user.interests,
            themePreference: user.themePreference,
            isPrivate: user.isPrivate,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const logout = (req, res) => {
    try{
        // Clear with the SAME SameSite/Secure attributes used to set it, or the
        // browser rejects the clearing cookie cross-site and logout won't stick.
        res.cookie("jwt", "", {...cookieBaseOptions(), maxAge: 0})
        res.status(200).json({message: "Logged out successfully"});
    } catch(error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};


export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user);
    } catch (error){
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const verifyEmailOTP = async (req, res) => {
    const { username, otp } = req.body;
    try {
        const identifierQuery = getIdentifierQuery(username);
        if (!identifierQuery) {
            return res.status(400).json({ message: "Username or email is required" });
        }

        const hashedOTP = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const user = await User.findOne({
            ...identifierQuery,
            emailOTP: hashedOTP,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        user.isVerified = true;
        user.emailOTP = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Error in verifyEmailOTP controller:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

export const sendOTP = async (req, res) => {
    const { username, email } = req.body || {};

    try {
        if (!username && !email) {
            return res.status(400).json({ message: "username or email is required" });
        }

        let userEmail = email;
        let userQuery = null;

        if (!userEmail && username) {
            userQuery = getIdentifierQuery(username);
            if (!userQuery) {
                return res.status(400).json({ message: "Username or email is required" });
            }

            const user = await User.findOne(userQuery, { email: 1, _id: 0 });
            userEmail = user?.email;
        } else if (userEmail) {
            userQuery = { email: String(userEmail).toLowerCase().trim() };
        }

        if (!userEmail) {
            return res.status(400).json({ message: "User not found" });
        }

        const otp = generateOTP();
        await User.findOneAndUpdate(
            userQuery,
            {
                emailOTP: otp.hashedOTP,
                otpExpires: otp.expires
            }
        );

        await sendOTPEmail(userEmail, otp.plainOTP);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Error in sendOTP controller:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/*
Forgot-password flow (3 steps):
  1. forgotPassword     — email a single-use reset OTP to the account on file.
  2. verifyResetOTP     — check the OTP is valid WITHOUT consuming it (UX gate
                          so the user knows the code is good before typing a new
                          password). Reset only happens in step 3.
  3. resetPassword      — re-validate the OTP and set the new password atomically,
                          then clear the reset fields (single use).

Uses dedicated resetPasswordOTP / resetPasswordExpires fields so a reset code can
never be substituted for an email-verification code (emailOTP) or vice versa.
Responses are deliberately generic to avoid leaking whether an account exists.
*/
export const forgotPassword = async (req, res) => {
    // identifier may be an email or a username (matches login / sendOTP behaviour).
    const identifier = req.body?.email ?? req.body?.username;
    // Generic response used whether or not the account exists (no user enumeration).
    const genericResponse = { message: "If an account exists for that address, a reset code has been sent." };

    try {
        const identifierQuery = getIdentifierQuery(identifier);
        if (!identifierQuery) {
            return res.status(400).json({ message: "Email or username is required" });
        }

        const user = await User.findOne(identifierQuery);

        // Do not reveal absence — respond the same as the success path.
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const otp = generateOTP();
        user.resetPasswordOTP = otp.hashedOTP;
        user.resetPasswordExpires = otp.expires;
        await user.save();

        await sendOTPEmail(user.email, otp.plainOTP, {
            subject: "Password Reset OTP",
            heading: "Your password reset code",
            note: "Use this code to reset your password. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.",
        });

        res.status(200).json(genericResponse);
    } catch (error) {
        console.error("Error in forgotPassword controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Validates the reset OTP without consuming it (see flow note above).
export const verifyResetOTP = async (req, res) => {
    const identifier = req.body?.email ?? req.body?.username;
    const { otp } = req.body || {};

    try {
        const identifierQuery = getIdentifierQuery(identifier);
        if (!identifierQuery || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const hashedOTP = crypto.createHash("sha256").update(String(otp)).digest("hex");

        const user = await User.findOne({
            ...identifierQuery,
            resetPasswordOTP: hashedOTP,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({ message: "OTP verified" });
    } catch (error) {
        console.error("Error in verifyResetOTP controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Re-validates the OTP and sets the new password atomically, then clears the
// reset fields so the code cannot be reused.
export const resetPassword = async (req, res) => {
    const identifier = req.body?.email ?? req.body?.username;
    const { otp, newPassword } = req.body || {};

    try {
        const identifierQuery = getIdentifierQuery(identifier);
        if (!identifierQuery || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const hashedOTP = crypto.createHash("sha256").update(String(otp)).digest("hex");

        const user = await User.findOne({
            ...identifierQuery,
            resetPasswordOTP: hashedOTP,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        // Owning the reset code proves control of the email, so treat the account
        // as verified — otherwise a reset could dead-end at the "not verified" gate.
        user.isVerified = true;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in resetPassword controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    const {_id, username} = req.user;    
    const {isPrivate, avatar, bio, interests, themePreference} = req.body;
    let avatarUrl = avatar;
    const normalizedInterests = normalizeInterests(interests);
    try{
        if (avatar) {
        if (isHostedImageUrl(avatar)) {
            avatarUrl = avatar;
        } else {
            assertImageOk(avatar);
            const uploadResponse = await cloudinary.uploader.upload(avatar);
            avatarUrl = uploadResponse.secure_url
        }
        }
        const updatedUser = await User.findByIdAndUpdate(_id, 
            {
            avatar: avatarUrl,   
            bio: bio, 
            interests: normalizedInterests, 
            themePreference: themePreference, 
            isPrivate: isPrivate},
        {new: true});
        res.status(200).json({
            message: "Profile Updated",
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            interests: updatedUser.interests,
            isPrivate: updatedUser.isPrivate,
            themePreference: updatedUser.themePreference,
        });
    } catch (error){
        const status = error.status || 500;
        if (status === 500) {
            console.error("Error in update profile", error);
            return res.status(500).json({message: "Internal Server Error"});
        }
        return res.status(status).json({message: error.message});
    }
};

const normalizeInterest = (value = "") => {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-_]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

const normalizeInterests = (interests = []) => {
    return Array.from(
        new Set(
            (Array.isArray(interests) ? interests : [])
                .map(normalizeInterest)
                .filter(Boolean)
        )
    );
};
export const updateTheme = async (req, res) => {
    const {_id} = req.user;
    const {themePreference} = req.body;
    try{
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {themePreference: themePreference},
            {new: true}
        );
        res.status(200).json({
            message: "Theme Updated",
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            interests: updatedUser.interests,
            isPrivate: updatedUser.isPrivate,
            themePreference: updatedUser.themePreference,
        });
    } catch (error){
        console.log("Error in update theme", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};


export const updateProfileSection = async (req, res) => {
    const {_id} = req.user;
    const {bio, avatar, username} = req.body;
    try{
        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) {
            if (isHostedImageUrl(avatar)) {
                updateData.avatar = avatar;
            } else {
                assertImageOk(avatar);
                const uploadResponse = await cloudinary.uploader.upload(avatar);
                updateData.avatar = uploadResponse.secure_url;
            }
        }
        if (username !== undefined) {
            const existingUser = await User.findOne({
            username,
            _id: { $ne: _id } // exclude current user
            });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }
            updateData.username = username;
        }

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            updateData,
            {new: true}
        );
        res.status(200).json({message: "Profile section updated", user: updatedUser});
    } catch (error) {
        const status = error.status || 500;
        if (status === 500) {
            console.error("Error in update profile section", error);
            return res.status(500).json({message: "Internal Server Error"});
        }
        return res.status(status).json({message: error.message});
    }
};

export const getProfileInfo = async (req, res) => {
    const {_id} = req.user;
    try {
        const user = await User.findById(_id).select("username avatar bio interests");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ username: user.username, avatar: user.avatar, bio: user.bio, interests: user.interests });
    } catch (error) {
        console.log("Error in getProfileInfo", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};