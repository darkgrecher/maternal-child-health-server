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
exports.CreateChildDto = exports.DeliveryType = exports.BloodType = exports.Gender = void 0;
const class_validator_1 = require("class-validator");
var Gender;
(function (Gender) {
    Gender["male"] = "male";
    Gender["female"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var BloodType;
(function (BloodType) {
    BloodType["A_POSITIVE"] = "A+";
    BloodType["A_NEGATIVE"] = "A-";
    BloodType["B_POSITIVE"] = "B+";
    BloodType["B_NEGATIVE"] = "B-";
    BloodType["AB_POSITIVE"] = "AB+";
    BloodType["AB_NEGATIVE"] = "AB-";
    BloodType["O_POSITIVE"] = "O+";
    BloodType["O_NEGATIVE"] = "O-";
    BloodType["unknown"] = "unknown";
})(BloodType || (exports.BloodType = BloodType = {}));
var DeliveryType;
(function (DeliveryType) {
    DeliveryType["normal"] = "normal";
    DeliveryType["cesarean"] = "cesarean";
    DeliveryType["assisted"] = "assisted";
})(DeliveryType || (exports.DeliveryType = DeliveryType = {}));
class CreateChildDto {
    firstName;
    lastName;
    dateOfBirth;
    gender;
    chdrNumber;
    photoUri;
    birthWeight;
    birthHeight;
    birthHeadCircumference;
    bloodType;
    placeOfBirth;
    deliveryType;
    allergies;
    specialConditions;
    motherName;
    fatherName;
    emergencyContact;
    address;
}
exports.CreateChildDto = CreateChildDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], CreateChildDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "chdrNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "photoUri", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateChildDto.prototype, "birthWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateChildDto.prototype, "birthHeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateChildDto.prototype, "birthHeadCircumference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BloodType),
    __metadata("design:type", String)
], CreateChildDto.prototype, "bloodType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "placeOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DeliveryType),
    __metadata("design:type", String)
], CreateChildDto.prototype, "deliveryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateChildDto.prototype, "allergies", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateChildDto.prototype, "specialConditions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "motherName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "fatherName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "emergencyContact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "address", void 0);
//# sourceMappingURL=create-child.dto.js.map