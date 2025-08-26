import type {Prisma} from '@prisma/client'
import {DeviceType, DeviceRepairStatus, SaleStatus, DevicePartStatus, MovementType} from '@prisma/client'

// =============================================================================
// SELECT CONSTANTS - Single Source of Truth
// =============================================================================

// Device selects
export const DEVICE_BASE_SELECT = {
    id: true,
    customerId: true,
    deviceType: true,
    brand: true,
    model: true,
    serialNumber: true,
    warrantyMonths: true,
    price: true,
    repairStatus: true,
    saleStatus: true,
    createdAt: true,
    updatedAt: true,
} as const satisfies Prisma.DeviceSelect

export const DEVICE_LIST_SELECT = {
    ...DEVICE_BASE_SELECT,
    customer: {
        select: {
            name: true,
        }
    }
} as const satisfies Prisma.DeviceSelect

export const DEVICE_WITH_RELATIONS_SELECT = {
    ...DEVICE_BASE_SELECT,
    customer: {
        select: {
            id: true,
            name: true,
            email: true,
        }
    },
    parts: {
        select: {
            id: true,
            name: true,
            model: true,
            serialNumber: true,
            price: true,
            quantity: true,
            status: true,
        }
    },
    repairHistory: {
        select: {
            id: true,
            diagnosis: true,
            repairDate: true,
            technician: {
                select: {
                    id: true,
                    user: {
                        select: {name: true}
                    }
                }
            },
            partsUsed: {
                select: {
                    id: true,
                    name: true,
                    model: true,
                    price: true,
                }
            }
        }
    }
} as const satisfies Prisma.DeviceSelect

// Device Part selects
export const DEVICE_PART_BASE_SELECT = {
    id: true,
    customerDeviceId: true,
    name: true,
    model: true,
    serialNumber: true,
    price: true,
    quantity: true,
    status: true,
    warrantyMonths: true,
    createdAt: true,
    updatedAt: true,
} as const satisfies Prisma.DevicePartSelect

export const DEVICE_PART_LIST_SELECT = {
    ...DEVICE_PART_BASE_SELECT,
    customerDevice: {
        select: {
            customer: {
                select: {
                    name: true,
                }
            }
        }
    }
} as const satisfies Prisma.DevicePartSelect

export const DEVICE_PART_WITH_RELATIONS_SELECT = {
    ...DEVICE_PART_BASE_SELECT,
    customerDevice: {
        select: {
            id: true,
            brand: true,
            model: true,
            customer: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    },
    movements: {
        select: {
            id: true,
            quantity: true,
            movementType: true,
            notes: true,
            createdAt: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    }
} as const satisfies Prisma.DevicePartSelect

// Part Movement selects
export const PART_MOVEMENT_BASE_SELECT = {
    id: true,
    partId: true,
    quantity: true,
    movementType: true,
    notes: true,
    createdAt: true,
    createdById: true,
} as const satisfies Prisma.PartMovementSelect

export const PART_MOVEMENT_LIST_SELECT = {
    ...PART_MOVEMENT_BASE_SELECT,
    part: {
        select: {
            name: true,
            model: true,
        }
    },
    createdBy: {
        select: {
            name: true,
        }
    }
} as const satisfies Prisma.PartMovementSelect

export const PART_MOVEMENT_WITH_RELATIONS_SELECT = {
    ...PART_MOVEMENT_BASE_SELECT,
    part: {
        select: {
            id: true,
            name: true,
            model: true,
        }
    },
    createdBy: {
        select: {
            id: true,
            name: true,
        }
    }
} as const satisfies Prisma.PartMovementSelect

// Repair History selects
export const REPAIR_HISTORY_SELECT = {
    id: true,
    deviceId: true,
    bookingId: true,
    technicianId: true,
    diagnosis: true,
    repairDate: true,
    technician: {
        select: {
            id: true,
            user: {
                select: {
                    name: true,
                }
            }
        }
    },
    partsUsed: {
        select: {
            id: true,
            name: true,
            model: true,
            price: true,
        }
    }
} as const satisfies Prisma.RepairHistorySelect

// =============================================================================
// RAW DTO TYPES - Direct from Prisma
// =============================================================================

export type DeviceDTO = Prisma.DeviceGetPayload<{
    select: typeof DEVICE_BASE_SELECT
}>

export type DeviceListDTO = Prisma.DeviceGetPayload<{
    select: typeof DEVICE_LIST_SELECT
}>

export type DeviceWithRelationsDTO = Prisma.DeviceGetPayload<{
    select: typeof DEVICE_WITH_RELATIONS_SELECT
}>

export type DevicePartDTO = Prisma.DevicePartGetPayload<{
    select: typeof DEVICE_PART_BASE_SELECT
}>

export type DevicePartListDTO = Prisma.DevicePartGetPayload<{
    select: typeof DEVICE_PART_LIST_SELECT
}>

export type DevicePartWithRelationsDTO = Prisma.DevicePartGetPayload<{
    select: typeof DEVICE_PART_WITH_RELATIONS_SELECT
}>

export type PartMovementDTO = Prisma.PartMovementGetPayload<{
    select: typeof PART_MOVEMENT_BASE_SELECT
}>

export type PartMovementListDTO = Prisma.PartMovementGetPayload<{
    select: typeof PART_MOVEMENT_LIST_SELECT
}>

export type PartMovementWithRelationsDTO = Prisma.PartMovementGetPayload<{
    select: typeof PART_MOVEMENT_WITH_RELATIONS_SELECT
}>

export type RepairHistoryDTO = Prisma.RepairHistoryGetPayload<{
    select: typeof REPAIR_HISTORY_SELECT
}>

// =============================================================================
// CLIENT-SAFE DTO TYPES - Decimal converted to number
// =============================================================================

// Device Client DTOs
export type DeviceClientDTO = Omit<DeviceDTO, 'price'> & {
    price: number | null
}

export type DeviceListClientDTO = Omit<DeviceListDTO, 'price'> & {
    price: number | null
    customerName: string | null
}

export type DeviceWithRelationsClientDTO = Omit<DeviceWithRelationsDTO, 'price' | 'parts' | 'repairHistory'> & {
    price: number | null
    customer?: DeviceWithRelationsDTO['customer']
    parts?: Array<Omit<NonNullable<DeviceWithRelationsDTO['parts']>[0], 'price'> & { price: number | null }>
    repairHistory?: Array<Omit<NonNullable<DeviceWithRelationsDTO['repairHistory']>[0], 'partsUsed'> & {
        partsUsed: Array<Omit<NonNullable<DeviceWithRelationsDTO['repairHistory']>[0]['partsUsed'][0], 'price'> & {
            price: number | null
        }>
    }>
}

// Device Part Client DTOs
export type DevicePartClientDTO = Omit<DevicePartDTO, 'price'> & {
    price: number | null
}

export type DevicePartListClientDTO = Omit<DevicePartListDTO, 'price'> & {
    price: number | null
    customerName: string | null
}

export type DevicePartWithRelationsClientDTO = Omit<DevicePartWithRelationsDTO, 'price'> & {
    price: number | null
    customerDevice?: DevicePartWithRelationsDTO['customerDevice']
    movements?: DevicePartWithRelationsDTO['movements']
}

// Part Movement Client DTOs (no price conversion needed)
export type PartMovementClientDTO = PartMovementDTO
export type PartMovementListClientDTO = PartMovementListDTO & {
    partName: string
    partModel: string
    createdByName: string | null
}
export type PartMovementWithRelationsClientDTO = PartMovementWithRelationsDTO

// Repair History Client DTOs
export type RepairHistoryClientDTO = Omit<RepairHistoryDTO, 'partsUsed'> & {
    partsUsed: Array<Omit<RepairHistoryDTO['partsUsed'][0], 'price'> & { price: number | null }>
}

// =============================================================================
// INPUT TYPES - For create/update operations
// =============================================================================

export type CreateDeviceInput = {
    customerId?: string
    deviceType: DeviceType
    brand: string
    model?: string
    serialNumber: string
    warrantyMonths?: number
    price?: number
    repairStatus?: DeviceRepairStatus
    saleStatus: SaleStatus
}

export type UpdateDeviceInput = {
    customerId?: string | null
    deviceType?: DeviceType
    brand?: string
    model?: string
    serialNumber?: string
    warrantyMonths?: number
    price?: number
    repairStatus?: DeviceRepairStatus
    saleStatus?: SaleStatus
}

export type CreateDevicePartInput = {
    customerDeviceId?: string
    name: string
    model: string
    serialNumber: string
    price?: number
    quantity?: number
    status?: DevicePartStatus
    warrantyMonths?: number
}

export type UpdateDevicePartInput = {
    customerDeviceId?: string | null
    name?: string
    model?: string
    serialNumber?: string
    price?: number
    quantity?: number
    status?: DevicePartStatus
    warrantyMonths?: number
}

export type CreatePartMovementInput = {
    partId: string
    quantity: number
    movementType: MovementType
    notes?: string
}

export type CreateRepairHistoryInput = {
    deviceId: string
    bookingId?: string
    technicianId?: string
    diagnosis: string
    partsUsedIds?: string[]
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export type DeviceFilters = {
    search?: string
    deviceType?: DeviceType
    repairStatus?: DeviceRepairStatus
    saleStatus?: SaleStatus
    customerId?: string
    priceRange?: {
        min?: number
        max?: number
    }
}

export type DevicePartFilters = {
    search?: string
    status?: DevicePartStatus
    customerDeviceId?: string
    priceRange?: {
        min?: number
        max?: number
    }
    quantityRange?: {
        min?: number
        max?: number
    }
}

export type PartMovementFilters = {
    partId?: string
    movementType?: MovementType
    createdById?: string
    dateRange?: {
        from?: Date
        to?: Date
    }
}