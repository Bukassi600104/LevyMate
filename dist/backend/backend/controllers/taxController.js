"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTax = exports.createTaxRule = exports.getTaxRules = void 0;
const data_source_1 = require("../data-source");
const TaxRule_1 = require("../entities/TaxRule");
const Income_1 = require("../entities/Income");
const Expense_1 = require("../entities/Expense");
const tax_engine_1 = require("../../src/lib/tax-engine");
const typeorm_1 = require("typeorm");
const taxRuleRepository = data_source_1.AppDataSource.getRepository(TaxRule_1.TaxRule);
const incomeRepository = data_source_1.AppDataSource.getRepository(Income_1.Income);
const expenseRepository = data_source_1.AppDataSource.getRepository(Expense_1.Expense);
const getTaxRules = async (req, res) => {
    try {
        const { version } = req.query;
        if (version) {
            const rule = await taxRuleRepository.findOne({
                where: { rule_version: version },
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
    }
    catch (error) {
        console.error("Get tax rules error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getTaxRules = getTaxRules;
const createTaxRule = async (req, res) => {
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
    }
    catch (error) {
        console.error("Create tax rule error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.createTaxRule = createTaxRule;
const estimateTax = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { startDate, endDate, annualRentPaid } = req.query;
        const whereClause = {
            user: { id: userId },
        };
        if (startDate && endDate) {
            whereClause.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (startDate) {
            whereClause.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        const income = await incomeRepository.find({ where: whereClause });
        const expenses = await expenseRepository.find({ where: whereClause });
        const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const latestRule = await taxRuleRepository.findOne({
            order: { effective_date: "DESC" },
        });
        if (!latestRule) {
            return res.status(404).json({ error: "No tax rules configured" });
        }
        const rentPaid = annualRentPaid ? parseFloat(annualRentPaid) : 0;
        const taxCalculation = (0, tax_engine_1.computePIT)(totalIncome, totalExpenses, rentPaid, latestRule.rule_json);
        return res.json({
            totalIncome,
            totalExpenses,
            annualRentPaid: rentPaid,
            taxCalculation,
        });
    }
    catch (error) {
        console.error("Estimate tax error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.estimateTax = estimateTax;
