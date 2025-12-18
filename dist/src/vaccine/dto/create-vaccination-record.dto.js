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
exports.CreateVaccinationRecordDto = exports.VaccinationStatusDto = void 0;
const class_validator_1 = require("class-validator");
var VaccinationStatusDto;
(function (VaccinationStatusDto) {
    VaccinationStatusDto["pending"] = "pending";
    VaccinationStatusDto["completed"] = "completed";
    VaccinationStatusDto["overdue"] = "overdue";
    VaccinationStatusDto["missed"] = "missed";
    VaccinationStatusDto["scheduled"] = "scheduled";
})(VaccinationStatusDto || (exports.VaccinationStatusDto = VaccinationStatusDto = {}));
class CreateVaccinationRecordDto {
    childId;
    vaccineId;
    scheduledDate;
    status;
    administeredDate;
    administeredBy;
    location;
    batchNumber;
    notes;
    sideEffectsOccurred;
}
exports.CreateVaccinationRecordDto = CreateVaccinationRecordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "childId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "vaccineId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VaccinationStatusDto),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "administeredDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "administeredBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "batchNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationRecordDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateVaccinationRecordDto.prototype, "sideEffectsOccurred", void 0);
//# sourceMappingURL=create-vaccination-record.dto.js.map