import { DataSource } from "typeorm";
import { User, Income, Expense, TaxRule } from "../entities";
import path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "levymate_db",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Income, Expense, TaxRule],
  migrations: [path.join(__dirname, "../../migrations/*.ts")],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database initialized successfully");
    }
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
};
