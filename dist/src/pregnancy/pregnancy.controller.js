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
exports.PregnancyController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const pregnancy_service_1 = require("./pregnancy.service");
const dto_1 = require("./dto");
let PregnancyController = class PregnancyController {
    pregnancyService;
    constructor(pregnancyService) {
        this.pregnancyService = pregnancyService;
    }
    async create(req, dto) {
        return this.pregnancyService.create(req.user.id, dto);
    }
    async findAll(req) {
        return this.pregnancyService.findAll(req.user.id);
    }
    async findActive(req) {
        return this.pregnancyService.findActive(req.user.id);
    }
    async findOne(req, id) {
        return this.pregnancyService.findOne(req.user.id, id);
    }
    async update(req, id, dto) {
        return this.pregnancyService.update(req.user.id, id, dto);
    }
    async delete(req, id) {
        return this.pregnancyService.delete(req.user.id, id);
    }
    async convertToChild(req, id, dto) {
        return this.pregnancyService.convertToChild(req.user.id, id, dto);
    }
    async addCheckup(req, id, dto) {
        return this.pregnancyService.addCheckup(req.user.id, id, dto);
    }
    async getCheckups(req, id) {
        return this.pregnancyService.getCheckups(req.user.id, id);
    }
    async addMeasurement(req, id, dto) {
        return this.pregnancyService.addMeasurement(req.user.id, id, dto);
    }
    async getMeasurements(req, id) {
        return this.pregnancyService.getMeasurements(req.user.id, id);
    }
};
exports.PregnancyController = PregnancyController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreatePregnancyDto]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdatePregnancyDto]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/convert-to-child'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.ConvertToChildDto]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "convertToChild", null);
__decorate([
    (0, common_1.Post)(':id/checkups'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreatePregnancyCheckupDto]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "addCheckup", null);
__decorate([
    (0, common_1.Get)(':id/checkups'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "getCheckups", null);
__decorate([
    (0, common_1.Post)(':id/measurements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreatePregnancyMeasurementDto]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "addMeasurement", null);
__decorate([
    (0, common_1.Get)(':id/measurements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PregnancyController.prototype, "getMeasurements", null);
exports.PregnancyController = PregnancyController = __decorate([
    (0, common_1.Controller)('pregnancies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pregnancy_service_1.PregnancyService])
], PregnancyController);
//# sourceMappingURL=pregnancy.controller.js.map