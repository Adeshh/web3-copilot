"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@/app/generated/prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var connectionString = process.env.DATABASE_URL;
var pool = new pg_1.Pool({ connectionString: connectionString });
var adapter = new adapter_pg_1.PrismaPg(pool);
var globalForPrisma = globalThis;
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({ adapter: adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'], });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
