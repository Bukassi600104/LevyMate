"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Income = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Income = class Income {
    constructor() {
        this.source = "manual";
    }
};
exports.Income = Income;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Income.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Income.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric" }),
    __metadata("design:type", Number)
], Income.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Income.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Income.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Income.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Array)
], Income.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], Income.prototype, "ocr_meta", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "manual" }),
    __metadata("design:type", String)
], Income.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Income.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Income.prototype, "updated_at", void 0);
exports.Income = Income = __decorate([
    (0, typeorm_1.Entity)("income")
], Income);
//# sourceMappingURL=Income.js.map