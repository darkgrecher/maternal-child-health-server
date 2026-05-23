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
exports.AdminDistrictsController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const admin_districts_service_1 = require("./admin-districts.service");
const dto_1 = require("./dto");
let AdminDistrictsController = class AdminDistrictsController {
    adminDistrictsService;
    constructor(adminDistrictsService) {
        this.adminDistrictsService = adminDistrictsService;
    }
    assertAdminAccess(req) {
        if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
            throw new common_1.ForbiddenException('Admin access required');
        }
    }
    async getDistricts(req) {
        this.assertAdminAccess(req);
        const data = await this.adminDistrictsService.getDistricts();
        return { success: true, data };
    }
    async updateMidwifeRegion(req, midwifeId, dto) {
        this.assertAdminAccess(req);
        const data = await this.adminDistrictsService.updateMidwifeRegion(midwifeId, dto);
        return { success: true, data };
    }
};
exports.AdminDistrictsController = AdminDistrictsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminDistrictsController.prototype, "getDistricts", null);
__decorate([
    (0, common_1.Patch)('midwives/:midwifeId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('midwifeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateMidwifeRegionDto]),
    __metadata("design:returntype", Promise)
], AdminDistrictsController.prototype, "updateMidwifeRegion", null);
exports.AdminDistrictsController = AdminDistrictsController = __decorate([
    (0, common_1.Controller)('admin/districts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_districts_service_1.AdminDistrictsService])
], AdminDistrictsController);
//# sourceMappingURL=admin-districts.controller.js.map