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
exports.CreatePregnancyJournalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePregnancyJournalDto {
    date;
    weekOfPregnancy;
    title;
    content;
    mood;
}
exports.CreatePregnancyJournalDto = CreatePregnancyJournalDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date of the journal entry', example: '2026-01-27' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePregnancyJournalDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Week of pregnancy', example: 20, minimum: 1, maximum: 42 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(42),
    __metadata("design:type", Number)
], CreatePregnancyJournalDto.prototype, "weekOfPregnancy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Title of the journal entry', example: 'First Kick!' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePregnancyJournalDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Content of the journal entry' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePregnancyJournalDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Mood at the time of entry',
        example: 'happy',
        enum: ['happy', 'excited', 'neutral', 'tired', 'anxious']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['happy', 'excited', 'neutral', 'tired', 'anxious']),
    __metadata("design:type", String)
], CreatePregnancyJournalDto.prototype, "mood", void 0);
//# sourceMappingURL=create-pregnancy-journal.dto.js.map