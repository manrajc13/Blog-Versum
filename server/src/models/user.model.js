import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minLength: 8
    },

    fullname: {
        type: String
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isPrivate: {
        type: Boolean,
        default: false
    }, 
    
    emailOTP: {
        type: String
    },

    otpExpires: {
        type: Date
    },

    resetPasswordOTP: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    },

    avatar: {
        type: String
    },

    bio: {
        type: String,
        maxlength: 300
    },

    interests: [{
        type: String
    }],

    themePreference: {
        type: String,
        default: "plain"
    },

    followerCount: {
        type: Number,
        default: 0
    },

    followingCount: {
        type: Number,
        default: 0
    },

    numberofBlogs: {
        type: Number, 
        default: 0
    }
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;