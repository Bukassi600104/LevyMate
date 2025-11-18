import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities";

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const user = this.userRepository.create({
        email,
        password_hash: hashedPassword,
        full_name,
      });

      await this.userRepository.save(user);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcryptjs.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { token } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ error: "Token refresh failed" });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      // Implementation would include sending reset email
      res.json({ message: "If email exists, password reset link sent" });
    } catch (error) {
      res.status(500).json({ error: "Forgot password failed" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      // Implementation would verify token and update password
      res.json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ error: "Password reset failed" });
    }
  }
}
