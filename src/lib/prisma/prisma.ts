import {PrismaClient} from '@prisma/client'
import {withAccelerate} from "@prisma/extension-accelerate";

const makeClient = () => new PrismaClient({
    datasources: {db: {url: process.env.DATABASE_URL}},
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}).$extends(withAccelerate());

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makeClient> };

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;