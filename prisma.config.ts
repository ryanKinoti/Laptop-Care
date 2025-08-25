import "dotenv/config";
import path from "node:path";
import {defineConfig} from "prisma/config";

export default defineConfig({
    // Point to a FOLDER → Prisma recursively loads all *.prisma files inside it
    // Current layout: prisma/schema.prisma (datasource/generator) + prisma/schema/*.prisma
    schema: path.join("prisma"),
    migrations: {
        path: path.join("prisma", "migrations"),
        seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
    },
});