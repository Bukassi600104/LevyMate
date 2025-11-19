import { Response } from "express";
import { AppDataSource } from "../data-source";
import { TaxRule } from "../entities/TaxRule";
import { Income } from "../entities/Income";
import { Expense } from "../entities/Expense";
import { AuthRequest } from "../middleware/auth";
import { computePIT } from "../../src/lib/tax-engine";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

const taxRuleRepository = AppDataSource.getRepository(TaxRule);
const incomeRepository = AppDataSource.getRepository(Income);
const expenseRepository = AppDataSource.getRepository(Expense);

export const getTaxRules = async (req: AuthRequest, res: Response) => {
  try {
    const { version } = req.query;

    if (version) {
      const rule = await taxRuleRepository.findOne({
        where: { rule_version: version as string },
      });

      if (!rule) {
        return res.status(404).json({ error: "Tax rule version not found" });
      }

      return res.json({ rule });
    }

    const latestRule = await taxRuleRepository.findOne({
      order: { effective_date: "DESC" },
    });

    if (!latestRule) {
      return res.status(404).json({ error: "No tax rules found" });
    }

    return res.json({ rule: latestRule });
  } catch (error) {
    console.error("Get tax rules error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createTaxRule = async (req: AuthRequest, res: Response) => {
  try {
    const { rule_version, effective_date, rule_json } = req.body;

    if (!rule_version || !effective_date || !rule_json) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingRule = await taxRuleRepository.findOne({
      where: { rule_version },
    });

    if (existingRule) {
      return res.status(400).json({ error: "Rule version already exists" });
    }

    const taxRule = taxRuleRepository.create({
      rule_version,
      effective_date,
      rule_json,
    });

    await taxRuleRepository.save(taxRule);

    return res.status(201).json({ rule: taxRule });
  } catch (error) {
    console.error("Create tax rule error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const estimateTax = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { startDate, endDate, annualRentPaid } = req.query;

    const whereClause: any = {
      user: { id: userId },
    };

    if (startDate && endDate) {
      whereClause.date = MoreThanOrEqual(startDate as string);
    } else if (startDate) {
      whereClause.date = MoreThanOrEqual(startDate as string);
    }

    const income = await incomeRepository.find({ where: whereClause });
    const expenses = await expenseRepository.find({ where: whereClause });

    const totalIncome = income.reduce((sum: number, i: Income) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum: number, e: Expense) => sum + Number(e.amount), 0);

    const latestRule = await taxRuleRepository.findOne({
      order: { effective_date: "DESC" },
    });

    if (!latestRule) {
      return res.status(404).json({ error: "No tax rules configured" });
    }

    const rentPaid = annualRentPaid ? parseFloat(annualRentPaid as string) : 0;

    const taxCalculation = computePIT(
      totalIncome,
      totalExpenses,
      rentPaid,
      latestRule.rule_json
    );

    return res.json({
      totalIncome,
      totalExpenses,
      annualRentPaid: rentPaid,
      taxCalculation,
    });
  } catch (error) {
    console.error("Estimate tax error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
