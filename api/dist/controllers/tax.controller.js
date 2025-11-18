"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxController = void 0;
const data_source_1 = require("../database/data-source");
const entities_1 = require("../entities");
class TaxController {
    constructor() {
        this.taxRuleRepository = data_source_1.AppDataSource.getRepository(entities_1.TaxRule);
        this.incomeRepository = data_source_1.AppDataSource.getRepository(entities_1.Income);
        this.expenseRepository = data_source_1.AppDataSource.getRepository(entities_1.Expense);
    }
    async getRules(req, res) {
        try {
            const rules = await this.taxRuleRepository.find({
                order: { effective_date: "DESC" },
            });
            res.json(rules);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch tax rules" });
        }
    }
    async getTaxEstimate(req, res) {
        try {
            const userId = req.user?.id;
            // Fetch all transactions for user
            const incomes = await this.incomeRepository.find({
                where: { user: { id: userId } },
            });
            const expenses = await this.expenseRepository.find({
                where: { user: { id: userId } },
            });
            // Get latest tax rules
            const latestRule = await this.taxRuleRepository.findOne({
                order: { effective_date: "DESC" },
            });
            if (!latestRule) {
                return res.status(400).json({ error: "No tax rules available" });
            }
            const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
            const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
            const taxableIncome = totalIncome - totalExpenses;
            const bands = latestRule.rule_json.pit_bands;
            // Calculate tax
            let tax = 0;
            let remaining = taxableIncome;
            for (const band of bands) {
                if (remaining <= 0)
                    break;
                const bandFrom = band.band_from;
                const bandTo = band.band_to || Infinity;
                const bandWidth = bandTo - bandFrom;
                if (taxableIncome <= bandFrom)
                    break;
                const amountInBand = Math.min(remaining, bandWidth);
                tax += amountInBand * band.rate;
                remaining -= amountInBand;
            }
            res.json({
                totalIncome,
                totalExpenses,
                taxableIncome,
                tax: Math.round(tax),
                rule_version: latestRule.rule_version,
            });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to calculate tax estimate" });
        }
    }
    async createRule(req, res) {
        try {
            const { rule_version, effective_date, rule_json } = req.body;
            // Check if user is admin (simplified - in production use roles)
            const rule = this.taxRuleRepository.create({
                rule_version,
                effective_date,
                rule_json,
            });
            await this.taxRuleRepository.save(rule);
            res.status(201).json(rule);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create tax rule" });
        }
    }
}
exports.TaxController = TaxController;
//# sourceMappingURL=tax.controller.js.map