import type {Prisma} from '@prisma/client'
import {DeviceType} from '@prisma/client'

// =============================================================================
// SELECT CONSTANTS - Single Source of Truth
// =============================================================================

// Service Category selects
export const SERVICE_CATEGORY_BASE_SELECT = {
    id: true,
    name: true,
    description: true,
    isActive: true,
} as const satisfies Prisma.ServiceCategorySelect

export const SERVICE_CATEGORY_WITH_SERVICES_SELECT = {
    ...SERVICE_CATEGORY_BASE_SELECT,
    services: {
        select: {
            id: true,
            name: true,
            description: true,
            device: true,
            price: true,
            notes: true,
            estimatedTime: true,
            isActive: true,
        }
    },
    _count: {
        select: {
            services: {
                where: {isActive: true}
            }
        }
    }
} as const satisfies Prisma.ServiceCategorySelect

export const SERVICE_CATEGORY_WITH_SERVICES_ADMIN_SELECT = {
    ...SERVICE_CATEGORY_BASE_SELECT,
    services: {
        select: {
            id: true,
            name: true,
            description: true,
            device: true,
            price: true,
            notes: true,
            estimatedTime: true,
            isActive: true,
        }
    },
    _count: {
        select: {
            services: true
        }
    }
} as const satisfies Prisma.ServiceCategorySelect

// Service selects
export const SERVICE_BASE_SELECT = {
    id: true,
    name: true,
    categoryId: true,
    description: true,
    device: true,
    price: true,
    notes: true,
    estimatedTime: true,
    isActive: true,
} as const satisfies Prisma.ServiceSelect

export const SERVICE_LIST_SELECT = {
    ...SERVICE_BASE_SELECT,
    category: {
        select: {
            name: true,
        }
    }
} as const satisfies Prisma.ServiceSelect

export const SERVICE_WITH_CATEGORY_SELECT = {
    ...SERVICE_BASE_SELECT,
    category: {
        select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
        }
    }
} as const satisfies Prisma.ServiceSelect

// =============================================================================
// RAW DTO TYPES - Direct from Prisma
// =============================================================================

export type ServiceCategoryDTO = Prisma.ServiceCategoryGetPayload<{
    select: typeof SERVICE_CATEGORY_BASE_SELECT
}>

export type ServiceCategoryWithServicesDTO = Prisma.ServiceCategoryGetPayload<{
    select: typeof SERVICE_CATEGORY_WITH_SERVICES_SELECT
}>

export type ServiceCategoryWithServicesAdminDTO = Prisma.ServiceCategoryGetPayload<{
    select: typeof SERVICE_CATEGORY_WITH_SERVICES_ADMIN_SELECT
}>

export type ServiceDTO = Prisma.ServiceGetPayload<{
    select: typeof SERVICE_BASE_SELECT
}>

export type ServiceListDTO = Prisma.ServiceGetPayload<{
    select: typeof SERVICE_LIST_SELECT
}>

export type ServiceWithCategoryDTO = Prisma.ServiceGetPayload<{
    select: typeof SERVICE_WITH_CATEGORY_SELECT
}>

// =============================================================================
// CLIENT-SAFE DTO TYPES - Decimal converted to number
// =============================================================================

// Service Category Client DTOs
export type ServiceCategoryClientDTO = ServiceCategoryDTO

export type ServiceCategoryWithServicesClientDTO = Omit<ServiceCategoryWithServicesDTO, 'services'> & {
    services: Array<Omit<ServiceCategoryWithServicesDTO['services'][0], 'price'> & { price: number }>
    _count: ServiceCategoryWithServicesDTO['_count']
}

export type ServiceCategoryWithServicesAdminClientDTO = Omit<ServiceCategoryWithServicesAdminDTO, 'services'> & {
    services: Array<Omit<ServiceCategoryWithServicesAdminDTO['services'][0], 'price'> & { price: number }>
    _count: ServiceCategoryWithServicesAdminDTO['_count']
}

// Service Client DTOs
export type ServiceClientDTO = Omit<ServiceDTO, 'price'> & {
    price: number
}

export type ServiceListClientDTO = Omit<ServiceListDTO, 'price'> & {
    price: number
    categoryName: string
}

export type ServiceWithCategoryClientDTO = Omit<ServiceWithCategoryDTO, 'price'> & {
    price: number
    category: ServiceWithCategoryDTO['category']
}

// =============================================================================
// INPUT TYPES - For create/update operations
// =============================================================================

export type CreateServiceCategoryInput = {
    name: string
    description?: string
}

export type UpdateServiceCategoryInput = {
    name?: string
    description?: string
    isActive?: boolean
}

export type CreateServiceInput = {
    name: string
    categoryId: string
    description?: string
    device: DeviceType
    price: number
    notes?: string
    estimatedTime: string
}

export type UpdateServiceInput = {
    name?: string
    categoryId?: string
    description?: string
    device?: DeviceType
    price?: number
    notes?: string
    estimatedTime?: string
    isActive?: boolean
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export type ServiceFilters = {
    search?: string
    categoryId?: string
    deviceType?: DeviceType
    isActive?: boolean
    priceRange?: {
        min?: number
        max?: number
    }
}

export type ServiceCategoryFilters = {
    search?: string
    isActive?: boolean
}

// =============================================================================
// STATISTICS TYPES
// =============================================================================

export type ServiceStatsResult = {
    totalServices: number
    activeServices: number
    inactiveServices: number
    totalCategories: number
    servicesByDevice: Array<{ device: DeviceType, count: number }>
    servicesByCategory: Array<{ categoryName: string, count: number }>
}