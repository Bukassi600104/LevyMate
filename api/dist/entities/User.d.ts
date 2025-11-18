export declare class User {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    business_name?: string;
    business_type?: string;
    subscription_plan: "free" | "pro";
    subscription_expires_at: Date | null;
    onboarded: boolean;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=User.d.ts.map