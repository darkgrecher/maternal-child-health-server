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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaccineController = void 0;
const common_1 = require("@nestjs/common");
const vaccine_service_1 = require("./vaccine.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let VaccineController = class VaccineController {
    vaccineService;
    constructor(vaccineService) {
        this.vaccineService = vaccineService;
    }
    async getAllVaccines() {
        const vaccines = await this.vaccineService.getAllVaccines();
        return {
            success: true,
            data: vaccines,
        };
    }
    async getVaccinesByAgeGroup() {
        const groups = await this.vaccineService.getVaccinesByAgeGroup();
        return {
            success: true,
            data: groups,
        };
    }
    async getChildVaccinationRecords(req, childId) {
        const data = await this.vaccineService.getChildVaccinationRecords(req.user.sub, childId);
        return {
            success: true,
            data,
        };
    }
    async administerVaccine(req, childId, vaccineId, dto) {
        const record = await this.vaccineService.administerVaccine(req.user.sub, childId, vaccineId, dto);
        return {
            success: true,
            data: record,
        };
    }
    async updateVaccinationRecord(req, recordId, dto) {
        const record = await this.vaccineService.updateVaccinationRecord(req.user.sub, recordId, dto);
        return {
            success: true,
            data: record,
        };
    }
    async seedVaccineSchedule() {
        const result = await this.vaccineService.seedVaccineSchedule();
        return {
            success: true,
            data: result,
        };
    }
};
exports.VaccineController = VaccineController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VaccineController.prototype, "getAllVaccines", null);
__decorate([
    (0, common_1.Get)('by-age-group'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VaccineController.prototype, "getVaccinesByAgeGroup", null);
__decorate([
    (0, common_1.Get)('child/:childId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VaccineController.prototype, "getChildVaccinationRecords", null);
__decorate([
    (0, common_1.Post)('child/:childId/administer/:vaccineId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('childId')),
    __param(2, (0, common_1.Param)('vaccineId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, dto_1.UpdateVaccinationRecordDto]),
    __metadata("design:returntype", Promise)
], VaccineController.prototype, "administerVaccine", null);
__decorate([
    (0, common_1.Patch)('records/:recordId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('recordId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateVaccinationRecordDto]),
    __metadata("design:returntype", Promise)
], VaccineController.prototype, "updateVaccinationRecord", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VaccineController.prototype, "seedVaccineSchedule", null);
exports.VaccineController = VaccineController = __decorate([
    (0, common_1.Controller)('vaccines'),
    __metadata("design:paramtypes", [vaccine_service_1.VaccineService])
], VaccineController);
//# sourceMappingURL=vaccine.controller.js.map