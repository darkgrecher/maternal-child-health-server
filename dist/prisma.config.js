"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("prisma/config");
(0, dotenv_1.config)({ path: node_path_1.default.join(__dirname, ".env") });
exports.default = (0, config_1.defineConfig)({
    schema: node_path_1.default.join(__dirname, "prisma/schema.prisma"),
    migrations: {
        path: node_path_1.default.join(__dirname, "prisma/migrations"),
    },
    datasource: {
        url: (0, config_1.env)("DATABASE_URL"),
    },
});
//# sourceMappingURL=prisma.config.js.map