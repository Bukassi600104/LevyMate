import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ nullable: true })
  full_name!: string;

  @Column({ nullable: true })
  business_name?: string;

  @Column({ nullable: true })
  business_type?: string;

  @Column({ default: "free" })
  subscription_plan: "free" | "pro" = "free";

  @Column({ type: "timestamptz", nullable: true })
  subscription_expires_at: Date | null = null;

  @Column({ type: "boolean", default: false })
  onboarded: boolean = false;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
