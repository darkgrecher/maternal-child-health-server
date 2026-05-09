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
exports.UpdateSettingsDto = exports.UpdateSettingsPreferencesDto = exports.UpdateSettingsNotificationsDto = exports.UpdateSettingsProfileDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateSettingsProfileDto {
    name;
    email;
    phone;
    picture;
}
exports.UpdateSettingsProfileDto = UpdateSettingsProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingsProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateSettingsProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingsProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingsProfileDto.prototype, "picture", void 0);
class UpdateSettingsNotificationsDto {
    appointments;
    vaccinations;
    highRisk;
    dailyDigest;
    emailNotifications;
    smsNotifications;
}
exports.UpdateSettingsNotificationsDto = UpdateSettingsNotificationsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsNotificationsDto.prototype, "appointments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsNotificationsDto.prototype, "vaccinations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsNotificationsDto.prototype, "highRisk", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsNotificationsDto.prototype, "dailyDigest", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsNotificationsDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsNotificationsDto.prototype, "smsNotifications", void 0);
class UpdateSettingsPreferencesDto {
    theme;
    language;
    dateFormat;
    notifications;
}
exports.UpdateSettingsPreferencesDto = UpdateSettingsPreferencesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['light', 'dark', 'system']),
    __metadata("design:type", String)
], UpdateSettingsPreferencesDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['en', 'si', 'ta']),
    __metadata("design:type", String)
], UpdateSettingsPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['mdy', 'dmy', 'ymd']),
    __metadata("design:type", String)
], UpdateSettingsPreferencesDto.prototype, "dateFormat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateSettingsNotificationsDto),
    __metadata("design:type", UpdateSettingsNotificationsDto)
], UpdateSettingsPreferencesDto.prototype, "notifications", void 0);
class UpdateSettingsDto {
    profile;
    preferences;
}
exports.UpdateSettingsDto = UpdateSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateSettingsProfileDto),
    __metadata("design:type", UpdateSettingsProfileDto)
], UpdateSettingsDto.prototype, "profile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateSettingsPreferencesDto),
    __metadata("design:type", UpdateSettingsPreferencesDto)
], UpdateSettingsDto.prototype, "preferences", void 0);
//# sourceMappingURL=update-settings.dto.js.map