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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("./activity.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
let ActivityController = class ActivityController {
    activityService;
    constructor(activityService) {
        this.activityService = activityService;
    }
    async getChildActivities(childId) {
        const activities = await this.activityService.getChildActivities(childId);
        return {
            success: true,
            data: activities,
        };
    }
    async getActivity(id) {
        const activity = await this.activityService.getActivity(id);
        return {
            success: true,
            data: activity,
        };
    }
    async createActivity(childId, dto) {
        const activity = await this.activityService.createActivity(childId, dto);
        return {
            success: true,
            data: activity,
        };
    }
    async updateActivity(id, dto) {
        const activity = await this.activityService.updateActivity(id, dto);
        return {
            success: true,
            data: activity,
        };
    }
    async deleteActivity(id) {
        const result = await this.activityService.deleteActivity(id);
        return {
            success: true,
            ...result,
        };
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)('child/:childId'),
    __param(0, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getChildActivities", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Post)('child/:childId'),
    __param(0, (0, common_1.Param)('childId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateActivityDto]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "createActivity", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateActivityDto]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "updateActivity", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "deleteActivity", null);
exports.ActivityController = ActivityController = __decorate([
    (0, common_1.Controller)('activity'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map