"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidwifeLinkModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const midwife_link_controller_1 = require("./midwife-link.controller");
const midwife_link_service_1 = require("./midwife-link.service");
let MidwifeLinkModule = class MidwifeLinkModule {
};
exports.MidwifeLinkModule = MidwifeLinkModule;
exports.MidwifeLinkModule = MidwifeLinkModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [midwife_link_controller_1.MidwifeLinkController],
        providers: [midwife_link_service_1.MidwifeLinkService],
    })
], MidwifeLinkModule);
//# sourceMappingURL=midwife-link.module.js.map