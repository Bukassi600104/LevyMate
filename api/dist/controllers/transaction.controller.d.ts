import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare class TransactionController {
    private incomeRepository;
    private expenseRepository;
    private userRepository;
    getIncomes(req: AuthRequest, res: Response): Promise<void>;
    createIncome(req: AuthRequest, res: Response): Promise<void>;
    updateIncome(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteIncome(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getExpenses(req: AuthRequest, res: Response): Promise<void>;
    createExpense(req: AuthRequest, res: Response): Promise<void>;
    updateExpense(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteExpense(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    startSubscription(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    subscriptionWebhook(req: Request, res: Response): Promise<void>;
    importWhatsApp(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=transaction.controller.d.ts.map