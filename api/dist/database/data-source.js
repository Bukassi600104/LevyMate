"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
const path_1 = __importDefault(require("path"));
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "levymate_db",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: [entities_1.User, entities_1.Income, entities_1.Expense, entities_1.TaxRule],
    migrations: [path_1.default.join(__dirname, "../../migrations/*.ts")],
    subscribers: [],
});
const initializeDatabase = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            console.log("Database initialized successfully");
        }
    }
    catch (error) {
        console.error("Error during database initialization:", error);
        process.exit(1);
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=data-source.js.map