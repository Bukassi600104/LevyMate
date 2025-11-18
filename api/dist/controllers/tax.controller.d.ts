import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare class TaxController {
    private taxRuleRepository;
    private incomeRepository;
    private expenseRepository;
    getRules(req: Request, res: Response): Promise<void>;
    getTaxEstimate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createRule(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=tax.controller.d.ts.map