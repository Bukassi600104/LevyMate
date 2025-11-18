import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("tax_rules")
export class TaxRule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  rule_version: string;

  @Column({ type: "date" })
  effective_date: string;

  @Column({ type: "jsonb" })
  rule_json: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
