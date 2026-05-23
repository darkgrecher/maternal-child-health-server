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
exports.AdminLogsController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const admin_logs_service_1 = require("./admin-logs.service");
let AdminLogsController = class AdminLogsController {
    adminLogsService;
    constructor(adminLogsService) {
        this.adminLogsService = adminLogsService;
    }
    assertAdminAccess(req) {
        if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
            throw new common_1.ForbiddenException('Admin access required');
        }
    }
    async getLogs(req, query) {
        this.assertAdminAccess(req);
        const data = await this.adminLogsService.getLogs(query);
        return { success: true, data };
    }
};
exports.AdminLogsController = AdminLogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminLogsController.prototype, "getLogs", null);
exports.AdminLogsController = AdminLogsController = __decorate([
    (0, common_1.Controller)('admin/logs'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_logs_service_1.AdminLogsService])
], AdminLogsController);
//# sourceMappingURL=admin-logs.controller.js.map