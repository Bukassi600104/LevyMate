import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("income")
export class Income {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: "numeric" })
  amount: number;

  @Column()
  category: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "jsonb", nullable: true })
  tags: string[];

  @Column({ type: "jsonb", nullable: true })
  ocr_meta: any;

  @Column({ default: "manual" })
  source: "manual" | "ocr" | "whatsapp";

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
