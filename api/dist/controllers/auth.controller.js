"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../database/data-source");
const entities_1 = require("../entities");
class AuthController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(entities_1.User);
    }
    async register(req, res) {
        try {
            const { email, password, full_name } = req.body;
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already registered" });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = this.userRepository.create({
                email,
                password_hash: hashedPassword,
                full_name,
            });
            await this.userRepository.save(user);
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
            res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
        }
        catch (error) {
            res.status(500).json({ error: "Registration failed" });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
            res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
        }
        catch (error) {
            res.status(500).json({ error: "Login failed" });
        }
    }
    async refresh(req, res) {
        try {
            const { token } = req.body;
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
            const newToken = jsonwebtoken_1.default.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
            res.json({ token: newToken });
        }
        catch (error) {
            res.status(401).json({ error: "Token refresh failed" });
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            // Implementation would include sending reset email
            res.json({ message: "If email exists, password reset link sent" });
        }
        catch (error) {
            res.status(500).json({ error: "Forgot password failed" });
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            // Implementation would verify token and update password
            res.json({ message: "Password reset successful" });
        }
        catch (error) {
            res.status(500).json({ error: "Password reset failed" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map