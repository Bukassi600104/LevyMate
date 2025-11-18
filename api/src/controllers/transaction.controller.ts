import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Income, Expense, User } from "../entities";
import { AuthRequest } from "../middleware/auth";

export class TransactionController {
  private incomeRepository = AppDataSource.getRepository(Income);
  private expenseRepository = AppDataSource.getRepository(Expense);
  private userRepository = AppDataSource.getRepository(User);

  // ====== INCOME ENDPOINTS ======

  async getIncomes(req: AuthRequest, res: Response) {
    try {
      const incomes = await this.incomeRepository.find({
        where: { user: { id: req.user?.id } },
      });
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incomes" });
    }
  }

  async createIncome(req: AuthRequest, res: Response) {
    try {
      const { amount, category, description, date, tags, source } = req.body;

      const income = this.incomeRepository.create({
        amount,
        category,
        description,
        date,
        tags,
        source: source || "manual",
        user: { id: req.user?.id },
      });

      await this.incomeRepository.save(income);
      res.status(201).json(income);
    } catch (error) {
      res.status(500).json({ error: "Failed to create income" });
    }
  }

  async updateIncome(req: AuthRequest, res: Response) {
    try {
      const { id } = (req as any).params;
      const { amount, category, description, date, tags } = req.body;

      const income = await this.incomeRepository.findOne({
        where: { id, user: { id: req.user?.id } },
      });

      if (!income) {
        return res.status(404).json({ error: "Income not found" });
      }

      Object.assign(income, { amount, category, description, date, tags });
      await this.incomeRepository.save(income);

      res.json(income);
    } catch (error) {
      res.status(500).json({ error: "Failed to update income" });
    }
  }

  async deleteIncome(req: AuthRequest, res: Response) {
    try {
      const { id } = (req as any).params;

      const income = await this.incomeRepository.findOne({
        where: { id, user: { id: req.user?.id } },
      });

      if (!income) {
        return res.status(404).json({ error: "Income not found" });
      }

      await this.incomeRepository.remove(income);
      res.json({ message: "Income deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income" });
    }
  }

  // ====== EXPENSE ENDPOINTS ======

  async getExpenses(req: AuthRequest, res: Response) {
    try {
      const expenses = await this.expenseRepository.find({
        where: { user: { id: req.user?.id } },
      });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  }

  async createExpense(req: AuthRequest, res: Response) {
    try {
      const { amount, category, description, date, tags, source } = req.body;

      const expense = this.expenseRepository.create({
        amount,
        category,
        description,
        date,
        tags,
        source: source || "manual",
        user: { id: req.user?.id },
      });

      await this.expenseRepository.save(expense);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense" });
    }
  }

  async updateExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = (req as any).params;
      const { amount, category, description, date, tags } = req.body;

      const expense = await this.expenseRepository.findOne({
        where: { id, user: { id: req.user?.id } },
      });

      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      Object.assign(expense, { amount, category, description, date, tags });
      await this.expenseRepository.save(expense);

      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense" });
    }
  }

  async deleteExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = (req as any).params;

      const expense = await this.expenseRepository.findOne({
        where: { id, user: { id: req.user?.id } },
      });

      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      await this.expenseRepository.remove(expense);
      res.json({ message: "Expense deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  }

  // ====== USER ENDPOINTS ======

  async getUser(req: AuthRequest, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't return password hash
      const { password_hash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { full_name, business_name, business_type } = req.body;

      const user = await this.userRepository.findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      Object.assign(user, {
        full_name: full_name || user.full_name,
        business_name: business_name || user.business_name,
        business_type: business_type || user.business_type,
      });

      await this.userRepository.save(user);

      const { password_hash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete all related income and expenses first (cascade handled by DB)
      await this.userRepository.remove(user);

      res.json({ message: "User account deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }

  // ====== SUBSCRIPTION ENDPOINTS ======

  async startSubscription(req: AuthRequest, res: Response) {
    try {
      const { plan } = req.body;

      if (!plan || !["free", "pro"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const user = await this.userRepository.findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate expiry date (30 days from now for pro plan)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      user.subscription_plan = plan;
      user.subscription_expires_at = plan === "pro" ? expiryDate : null;

      await this.userRepository.save(user);

      res.json({
        message: "Subscription updated",
        subscription_plan: user.subscription_plan,
        subscription_expires_at: user.subscription_expires_at,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription" });
    }
  }

  async subscriptionWebhook(req: Request, res: Response) {
    try {
      // Webhook signature verification should be done by middleware before this
      const { event, data } = req.body;

      if (event === "charge.success") {
        // Update user subscription
        const user = await this.userRepository.findOne({
          where: { email: data.customer.email },
        });

        if (user) {
          user.subscription_plan = "pro";
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          user.subscription_expires_at = expiryDate;

          await this.userRepository.save(user);
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  async importWhatsApp(req: AuthRequest, res: Response) {
    try {
      // This is a stub - actual implementation would:
      // 1. Parse WhatsApp text from request
      // 2. Extract transactions using WhatsApp parser service
      // 3. Create income/expense entries from parsed transactions
      // 4. Return created entries with confidence scores

      res.json({
        message: "WhatsApp import not yet implemented",
        stub: true,
      });
    } catch (error) {
      res.status(500).json({ error: "WhatsApp import failed" });
    }
  }
}

