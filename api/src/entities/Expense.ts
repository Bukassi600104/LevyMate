import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ type: "numeric" })
  amount!: number;

  @Column()
  category!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "jsonb", nullable: true })
  tags?: string[];

  @Column({ type: "jsonb", nullable: true })
  ocr_meta?: any;

  @Column({ default: "manual" })
  source: "manual" | "ocr" | "whatsapp" = "manual";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
