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
exports.CreateActivityDto = exports.ActivityType = void 0;
const class_validator_1 = require("class-validator");
var ActivityType;
(function (ActivityType) {
    ActivityType["VACCINATION"] = "vaccination";
    ActivityType["GROWTH"] = "growth";
    ActivityType["MILESTONE"] = "milestone";
    ActivityType["APPOINTMENT"] = "appointment";
    ActivityType["CHECKUP"] = "checkup";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
class CreateActivityDto {
    type;
    title;
    description;
    date;
    icon;
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, class_validator_1.IsEnum)(ActivityType),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "icon", void 0);
//# sourceMappingURL=create-activity.dto.js.map