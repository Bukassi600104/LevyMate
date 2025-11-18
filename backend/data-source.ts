import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Income } from "./entities/Income";
import { Expense } from "./entities/Expense";
import { TaxRule } from "./entities/TaxRule";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "levymate",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Income, Expense, TaxRule],
  migrations: ["./migrations/*.ts"],
  subscribers: [],
});
