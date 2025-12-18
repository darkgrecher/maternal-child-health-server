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
exports.ChildController = void 0;
const common_1 = require("@nestjs/common");
const child_service_1 = require("./child.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ChildController = class ChildController {
    childService;
    constructor(childService) {
        this.childService = childService;
    }
    async create(req, dto) {
        const child = await this.childService.create(req.user.sub, dto);
        return {
            success: true,
            data: child,
        };
    }
    async findAll(req) {
        const children = await this.childService.findAll(req.user.sub);
        return {
            success: true,
            data: children,
        };
    }
    async findOne(req, id) {
        const child = await this.childService.findOne(req.user.sub, id);
        return {
            success: true,
            data: child,
        };
    }
    async update(req, id, dto) {
        const child = await this.childService.update(req.user.sub, id, dto);
        return {
            success: true,
            data: child,
        };
    }
    async partialUpdate(req, id, dto) {
        const child = await this.childService.update(req.user.sub, id, dto);
        return {
            success: true,
            data: child,
        };
    }
    async remove(req, id) {
        const result = await this.childService.remove(req.user.sub, id);
        return {
            success: true,
            ...result,
        };
    }
};
exports.ChildController = ChildController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateChildDto]),
    __metadata("design:returntype", Promise)
], ChildController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChildController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChildController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateChildDto]),
    __metadata("design:returntype", Promise)
], ChildController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateChildDto]),
    __metadata("design:returntype", Promise)
], ChildController.prototype, "partialUpdate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChildController.prototype, "remove", null);
exports.ChildController = ChildController = __decorate([
    (0, common_1.Controller)('children'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [child_service_1.ChildService])
], ChildController);
//# sourceMappingURL=child.controller.js.map