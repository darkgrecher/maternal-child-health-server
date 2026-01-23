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
exports.EmergencyContactController = void 0;
const common_1 = require("@nestjs/common");
const emergency_contact_service_1 = require("./emergency-contact.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
let EmergencyContactController = class EmergencyContactController {
    emergencyContactService;
    constructor(emergencyContactService) {
        this.emergencyContactService = emergencyContactService;
    }
    async getUserContacts(req) {
        const contacts = await this.emergencyContactService.getUserContacts(req.user.sub);
        return {
            success: true,
            data: contacts,
        };
    }
    async getContact(req, id) {
        const contact = await this.emergencyContactService.getContact(req.user.sub, id);
        return {
            success: true,
            data: contact,
        };
    }
    async createContact(req, dto) {
        const contact = await this.emergencyContactService.createContact(req.user.sub, dto);
        return {
            success: true,
            data: contact,
        };
    }
    async updateContact(req, id, dto) {
        const contact = await this.emergencyContactService.updateContact(req.user.sub, id, dto);
        return {
            success: true,
            data: contact,
        };
    }
    async deleteContact(req, id) {
        const result = await this.emergencyContactService.deleteContact(req.user.sub, id);
        return {
            success: true,
            ...result,
        };
    }
    async setPrimaryContact(req, id) {
        const contact = await this.emergencyContactService.setPrimaryContact(req.user.sub, id);
        return {
            success: true,
            data: contact,
        };
    }
};
exports.EmergencyContactController = EmergencyContactController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmergencyContactController.prototype, "getUserContacts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmergencyContactController.prototype, "getContact", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateEmergencyContactDto]),
    __metadata("design:returntype", Promise)
], EmergencyContactController.prototype, "createContact", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateEmergencyContactDto]),
    __metadata("design:returntype", Promise)
], EmergencyContactController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmergencyContactController.prototype, "deleteContact", null);
__decorate([
    (0, common_1.Put)(':id/primary'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmergencyContactController.prototype, "setPrimaryContact", null);
exports.EmergencyContactController = EmergencyContactController = __decorate([
    (0, common_1.Controller)('emergency-contacts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [emergency_contact_service_1.EmergencyContactService])
], EmergencyContactController);
//# sourceMappingURL=emergency-contact.controller.js.map