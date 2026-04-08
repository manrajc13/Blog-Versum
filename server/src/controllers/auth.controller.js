import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../lib/utils/token.js";
import { generateOTP } from "../lib/utils/otp.js";
import { sendOTPEmail } from "../lib/utils/email.js";
import cloudinary from "../lib/cloudinary.js";


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
            return res.status(400).json({message: "Password must be at least 6 characters"});
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
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge: 0})
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
        res.status(500).json({
            message: error.message
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
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    const {_id, username} = req.user;    
    const {isPrivate, avatar, bio, interests, themePreference} = req.body;
    let avatarUrl = avatar;
    const normalizedInterests = normalizeInterests(interests);
    try{
        if (avatar) {
        const uploadResponse = await cloudinary.uploader.upload(avatar);
        avatarUrl = uploadResponse.secure_url
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
        console.log("Error in update profile", error);
        res.status(500).json({message: "Internal Server Error"});
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
            const uploadResponse = await cloudinary.uploader.upload(avatar);
            updateData.avatar = uploadResponse.secure_url;
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
        console.log("Error in update profile section", error);
        res.status(500).json({message: "Internal Server Error"});
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