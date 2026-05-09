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
exports.MidwifeLinkController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const midwife_link_service_1 = require("./midwife-link.service");
const dto_1 = require("./dto");
let MidwifeLinkController = class MidwifeLinkController {
    midwifeLinkService;
    constructor(midwifeLinkService) {
        this.midwifeLinkService = midwifeLinkService;
    }
    async generateQr(req, dto) {
        if (req.user?.actorType !== 'midwife') {
            throw new common_1.ForbiddenException('Midwife access required');
        }
        const data = await this.midwifeLinkService.generate(req.user.sub, dto.profileType);
        return { success: true, data };
    }
    async listNotifications(req) {
        if (req.user?.actorType !== 'midwife') {
            throw new common_1.ForbiddenException('Midwife access required');
        }
        const data = await this.midwifeLinkService.listNotifications(req.user.sub);
        return { success: true, data };
    }
    async getStatus(req, code) {
        if (req.user?.actorType !== 'midwife') {
            throw new common_1.ForbiddenException('Midwife access required');
        }
        const data = await this.midwifeLinkService.getStatus(req.user.sub, code);
        return { success: true, data };
    }
    async claim(req, dto) {
        if (req.user?.actorType !== 'user') {
            throw new common_1.ForbiddenException('User access required');
        }
        const data = await this.midwifeLinkService.claim(req.user.sub, dto);
        return { success: true, data };
    }
};
exports.MidwifeLinkController = MidwifeLinkController;
__decorate([
    (0, common_1.Post)('qr'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GenerateMidwifeLinkDto]),
    __metadata("design:returntype", Promise)
], MidwifeLinkController.prototype, "generateQr", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MidwifeLinkController.prototype, "listNotifications", null);
__decorate([
    (0, common_1.Get)('status/:code'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MidwifeLinkController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('claim'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ClaimMidwifeLinkDto]),
    __metadata("design:returntype", Promise)
], MidwifeLinkController.prototype, "claim", null);
exports.MidwifeLinkController = MidwifeLinkController = __decorate([
    (0, common_1.Controller)('midwife-links'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [midwife_link_service_1.MidwifeLinkService])
], MidwifeLinkController);
//# sourceMappingURL=midwife-link.controller.js.map