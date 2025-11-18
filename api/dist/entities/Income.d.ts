import { User } from "./User";
export declare class Income {
    id: string;
    user: User;
    amount: number;
    category: string;
    description?: string;
    date: string;
    tags?: string[];
    ocr_meta?: any;
    source: "manual" | "ocr" | "whatsapp";
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=Income.d.ts.map