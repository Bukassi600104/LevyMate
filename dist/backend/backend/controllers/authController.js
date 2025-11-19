"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refresh = exports.login = exports.register = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const register = async (req, res) => {
    try {
        const { email, password, full_name, business_name, business_type } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const password_hash = await (0, password_1.hashPassword)(password);
        const user = userRepository.create({
            email,
            password_hash,
            full_name,
            business_name,
            business_type,
            subscription_plan: "free",
            onboarded: false,
        });
        await userRepository.save(user);
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                business_name: user.business_name,
                business_type: user.business_type,
                subscription_plan: user.subscription_plan,
                onboarded: user.onboarded,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isValidPassword = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                business_name: user.business_name,
                business_type: user.business_type,
                subscription_plan: user.subscription_plan,
                onboarded: user.onboarded,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await userRepository.findOne({ where: { id: payload.userId } });
        if (!user) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        return res.json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        console.error("Refresh error:", error);
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
};
exports.refresh = refresh;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.json({ message: "If the email exists, a reset link has been sent" });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        console.log(`Password reset token for ${email}: ${resetToken}`);
        return res.json({ message: "If the email exists, a reset link has been sent" });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: "Token and password are required" });
        }
        return res.json({ message: "Password reset functionality will be implemented with token storage" });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
