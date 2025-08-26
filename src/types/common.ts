export type ActionResult<T = unknown> = {
    success: boolean
    data?: T
    error?: string
}

// Helper functions to convert Prisma Decimal to number for client
const convertDecimalFields = <T extends { price?: unknown }>(obj: T): T & { price: number | null } => ({
    ...obj,
    price: obj.price ? Number(obj.price) : null
})