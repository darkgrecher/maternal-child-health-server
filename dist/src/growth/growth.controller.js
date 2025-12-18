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
exports.GrowthController = void 0;
const common_1 = require("@nestjs/common");
const growth_service_1 = require("./growth.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
let GrowthController = class GrowthController {
    growthService;
    constructor(growthService) {
        this.growthService = growthService;
    }
    async getChildMeasurements(childId) {
        const data = await this.growthService.getChildMeasurements(childId);
        return { success: true, data };
    }
    async getChartData(childId, chartType = 'weight') {
        const data = await this.growthService.getChartData(childId, chartType);
        return { success: true, data };
    }
    async addMeasurement(childId, dto) {
        const data = await this.growthService.addMeasurement(childId, dto);
        return { success: true, data };
    }
    async updateMeasurement(measurementId, dto) {
        const data = await this.growthService.updateMeasurement(measurementId, dto);
        return { success: true, data };
    }
    async deleteMeasurement(measurementId) {
        const data = await this.growthService.deleteMeasurement(measurementId);
        return { success: true, data };
    }
};
exports.GrowthController = GrowthController;
__decorate([
    (0, common_1.Get)('child/:childId'),
    __param(0, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GrowthController.prototype, "getChildMeasurements", null);
__decorate([
    (0, common_1.Get)('child/:childId/chart'),
    __param(0, (0, common_1.Param)('childId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GrowthController.prototype, "getChartData", null);
__decorate([
    (0, common_1.Post)('child/:childId'),
    __param(0, (0, common_1.Param)('childId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateGrowthMeasurementDto]),
    __metadata("design:returntype", Promise)
], GrowthController.prototype, "addMeasurement", null);
__decorate([
    (0, common_1.Patch)(':measurementId'),
    __param(0, (0, common_1.Param)('measurementId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateGrowthMeasurementDto]),
    __metadata("design:returntype", Promise)
], GrowthController.prototype, "updateMeasurement", null);
__decorate([
    (0, common_1.Delete)(':measurementId'),
    __param(0, (0, common_1.Param)('measurementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GrowthController.prototype, "deleteMeasurement", null);
exports.GrowthController = GrowthController = __decorate([
    (0, common_1.Controller)('growth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [growth_service_1.GrowthService])
], GrowthController);
//# sourceMappingURL=growth.controller.js.map