"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactions = void 0;
const data_source_1 = require("../data-source");
const Income_1 = require("../entities/Income");
const Expense_1 = require("../entities/Expense");
const typeorm_1 = require("typeorm");
const incomeRepository = data_source_1.AppDataSource.getRepository(Income_1.Income);
const expenseRepository = data_source_1.AppDataSource.getRepository(Expense_1.Expense);
const getTransactions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { type, startDate, endDate, category } = req.query;
        const whereClause = {
            user: { id: userId },
        };
        if (startDate && endDate) {
            whereClause.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (startDate) {
            whereClause.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        if (category) {
            whereClause.category = category;
        }
        let income = [];
        let expenses = [];
        if (!type || type === "income") {
            income = await incomeRepository.find({
                where: whereClause,
                order: { date: "DESC" },
            });
        }
        if (!type || type === "expense") {
            expenses = await expenseRepository.find({
                where: whereClause,
                order: { date: "DESC" },
            });
        }
        const transactions = [
            ...income.map((i) => ({ ...i, type: "income" })),
            ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.json({ transactions });
    }
    catch (error) {
        console.error("Get transactions error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getTransactions = getTransactions;
const createTransaction = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { type, amount, category, description, date, tags, source, ocr_meta } = req.body;
        if (!type || !amount || !category || !date) {
            return res.status(400).json({ error: "Type, amount, category, and date are required" });
        }
        const transactionData = {
            user: { id: userId },
            amount: parseFloat(amount),
            category,
            description: description || null,
            date,
            tags: tags || null,
            source: source || "manual",
            ocr_meta: ocr_meta || null,
        };
        let transaction;
        if (type === "income") {
            transaction = incomeRepository.create(transactionData);
            await incomeRepository.save(transaction);
        }
        else if (type === "expense") {
            transaction = expenseRepository.create(transactionData);
            await expenseRepository.save(transaction);
        }
        else {
            return res.status(400).json({ error: "Invalid transaction type" });
        }
        return res.status(201).json({ transaction: { ...transaction, type } });
    }
    catch (error) {
        console.error("Create transaction error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { id } = req.params;
        const { type, amount, category, description, date, tags } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Type is required" });
        }
        const repository = type === "income" ? incomeRepository : expenseRepository;
        const transaction = await repository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        if (amount !== undefined)
            transaction.amount = parseFloat(amount);
        if (category)
            transaction.category = category;
        if (description !== undefined)
            transaction.description = description;
        if (date)
            transaction.date = date;
        if (tags !== undefined)
            transaction.tags = tags;
        await repository.save(transaction);
        return res.json({ transaction: { ...transaction, type } });
    }
    catch (error) {
        console.error("Update transaction error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { id } = req.params;
        const { type } = req.query;
        if (!type) {
            return res.status(400).json({ error: "Type query parameter is required" });
        }
        const repository = type === "income" ? incomeRepository : expenseRepository;
        const transaction = await repository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        await repository.remove(transaction);
        return res.json({ message: "Transaction deleted successfully" });
    }
    catch (error) {
        console.error("Delete transaction error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteTransaction = deleteTransaction;
