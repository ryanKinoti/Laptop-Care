import {prisma} from '@/lib/prisma/prisma'
import type {Prisma} from '@prisma/client'
import {
    // Select constants
    SERVICE_CATEGORY_BASE_SELECT,
    SERVICE_CATEGORY_WITH_SERVICES_SELECT,
    SERVICE_CATEGORY_WITH_SERVICES_ADMIN_SELECT,
    SERVICE_LIST_SELECT,
    SERVICE_WITH_CATEGORY_SELECT,
    // DTO types
    type ServiceCategoryWithServicesDTO,
    type ServiceCategoryWithServicesAdminDTO,
    type ServiceListDTO,
    type ServiceWithCategoryDTO,
    // Client-safe types
    type ServiceCategoryClientDTO,
    type ServiceCategoryWithServicesClientDTO,
    type ServiceCategoryWithServicesAdminClientDTO,
    type ServiceListClientDTO,
    type ServiceWithCategoryClientDTO,
    // Input types
    type CreateServiceCategoryInput,
    type UpdateServiceCategoryInput,
    type CreateServiceInput,
    type UpdateServiceInput,
    // Filter types
    type ServiceFilters,
    type ServiceStatsResult
} from '@/types/service'
import {DeviceType} from '@prisma/client'

// Re-export types for backwards compatibility
export type ServiceListItem = ServiceListClientDTO
export type ServiceWithCategory = ServiceWithCategoryClientDTO
export type CategoryWithServices = ServiceCategoryWithServicesClientDTO
export type {ServiceFilters}

export class ServiceService {
    // =============================================================================
    // PRIVATE HELPER METHODS - Decimal conversion
    // =============================================================================

    private static convertServiceToClient(service: ServiceListDTO): ServiceListClientDTO {
        return {
            ...service,
            price: Number(service.price),
            categoryName: service.category.name
        }
    }

    private static convertServiceWithCategoryToClient(service: ServiceWithCategoryDTO): ServiceWithCategoryClientDTO {
        return {
            ...service,
            price: Number(service.price),
            category: service.category
        }
    }

    private static convertServiceCategoryWithServicesToClient(category: ServiceCategoryWithServicesDTO): ServiceCategoryWithServicesClientDTO {
        return {
            ...category,
            services: category.services.map((service: ServiceCategoryWithServicesDTO['services'][0]) => ({
                ...service,
                price: Number(service.price)
            })),
            _count: category._count
        }
    }

    private static convertServiceCategoryWithServicesAdminToClient(category: ServiceCategoryWithServicesAdminDTO): ServiceCategoryWithServicesAdminClientDTO {
        return {
            ...category,
            services: category.services.map((service: ServiceCategoryWithServicesDTO['services'][0]) => ({
                ...service,
                price: Number(service.price)
            })),
            _count: category._count
        }
    }

    // =============================================================================
    // SERVICE OPERATIONS
    // =============================================================================

    static async getServiceList(
        filters: ServiceFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ services: ServiceListClientDTO[], total: number }> {
        // Build where clause
        const whereClause: Prisma.ServiceWhereInput = {}

        if (filters.search) {
            whereClause.OR = [
                {name: {contains: filters.search, mode: 'insensitive'}},
                {description: {contains: filters.search, mode: 'insensitive'}},
                {category: {name: {contains: filters.search, mode: 'insensitive'}}}
            ]
        }

        if (filters.categoryId) {
            whereClause.categoryId = filters.categoryId
        }

        if (filters.deviceType) {
            whereClause.device = filters.deviceType
        }

        if (typeof filters.isActive === 'boolean') {
            whereClause.isActive = filters.isActive
        }

        if (filters.priceRange) {
            whereClause.price = {}
            if (filters.priceRange.min !== undefined) {
                whereClause.price.gte = filters.priceRange.min
            }
            if (filters.priceRange.max !== undefined) {
                whereClause.price.lte = filters.priceRange.max
            }
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where: whereClause,
                select: SERVICE_LIST_SELECT,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{category: {name: 'asc'}}, {name: 'asc'}],
                cacheStrategy: {
                    ttl: 300,  // 5 minutes for service lists
                    swr: 600,  // serve stale for 10 minutes while revalidating
                    tags: ['services', 'service_list']
                }
            }) as unknown as Promise<ServiceListDTO[]>,
            prisma.service.count({
                where: whereClause,
                cacheStrategy: {
                    ttl: 300,
                    swr: 600,
                    tags: ['services', 'service_count']
                }
            })
        ])

        return {
            services: services.map(service => this.convertServiceToClient(service)),
            total
        }
    }

    static async getServiceWithCategory(serviceId: string): Promise<ServiceWithCategoryClientDTO | null> {
        const service = await prisma.service.findUnique({
            where: {id: serviceId},
            select: SERVICE_WITH_CATEGORY_SELECT,
            cacheStrategy: {
                ttl: 600,  // 10 minutes for individual service
                swr: 1800, // serve stale for 30 minutes
                tags: ['services', `service_${serviceId}`]
            }
        })

        if (!service) return null

        return this.convertServiceWithCategoryToClient(service)
    }

    static async createService(
        requesterId: string,
        serviceData: CreateServiceInput
    ): Promise<ServiceWithCategoryClientDTO> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can create services')
        }

        // Verify category exists and is active
        const category = await prisma.serviceCategory.findUnique({
            where: {id: serviceData.categoryId}
        })

        if (!category || !category.isActive) {
            throw new Error('Invalid or inactive service category')
        }

        // Check for duplicate service name within the same category and device type
        const existingService = await prisma.service.findFirst({
            where: {
                name: serviceData.name,
                categoryId: serviceData.categoryId,
                device: serviceData.device
            }
        })

        if (existingService) {
            throw new Error('Service with this name already exists for this category and device type')
        }

        const service = await prisma.service.create({
            data: serviceData,
            select: SERVICE_WITH_CATEGORY_SELECT
        })

        return this.convertServiceWithCategoryToClient(service)
    }

    static async updateService(
        requesterId: string,
        serviceId: string,
        updateData: UpdateServiceInput
    ): Promise<ServiceWithCategoryClientDTO> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can update services')
        }

        // Verify service exists
        const existingService = await this.getServiceWithCategory(serviceId)
        if (!existingService) {
            throw new Error('Service not found')
        }

        // If updating category, verify it exists and is active
        if (updateData.categoryId) {
            const category = await prisma.serviceCategory.findUnique({
                where: {id: updateData.categoryId}
            })

            if (!category || !category.isActive) {
                throw new Error('Invalid or inactive service category')
            }
        }

        // Check for duplicate name if name, category, or device is being updated
        if (updateData.name || updateData.categoryId || updateData.device) {
            const checkName = updateData.name || existingService.name
            const checkCategoryId = updateData.categoryId || existingService.categoryId
            const checkDevice = updateData.device || existingService.device

            const duplicateService = await prisma.service.findFirst({
                where: {
                    name: checkName,
                    categoryId: checkCategoryId,
                    device: checkDevice,
                    NOT: {id: serviceId}
                }
            })

            if (duplicateService) {
                throw new Error('Service with this name already exists for this category and device type')
            }
        }

        const service = await prisma.service.update({
            where: {id: serviceId},
            data: updateData,
            select: SERVICE_WITH_CATEGORY_SELECT
        })

        return this.convertServiceWithCategoryToClient(service)
    }

    static async deleteService(
        requesterId: string,
        serviceId: string
    ): Promise<void> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can delete services')
        }

        // Verify service exists
        const service = await prisma.service.findUnique({
            where: {id: serviceId}
        })

        if (!service) {
            throw new Error('Service not found')
        }

        await prisma.service.update({
            where: {id: serviceId},
            data: {isActive: false}
        })
    }

    static async restoreService(
        requesterId: string,
        serviceId: string
    ): Promise<ServiceWithCategoryClientDTO> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can restore services')
        }

        const service = await prisma.service.update({
            where: {id: serviceId},
            data: {isActive: true},
            select: SERVICE_WITH_CATEGORY_SELECT
        })

        return this.convertServiceWithCategoryToClient(service)
    }

    // =============================================================================
    // SERVICE CATEGORY OPERATIONS
    // =============================================================================

    static async getServiceCategories(
        includeInactive: boolean = false
    ): Promise<ServiceCategoryWithServicesClientDTO[]> {
        // No authentication required - public access (but only show active by default)
        const whereClause: Prisma.ServiceCategoryWhereInput = includeInactive
            ? {}
            : {isActive: true}

        const categories = await prisma.serviceCategory.findMany({
            where: whereClause,
            select: SERVICE_CATEGORY_WITH_SERVICES_SELECT,
            orderBy: {name: 'asc'},
            cacheStrategy: {
                ttl: 1800,  // 30 minutes for categories (public access)
                swr: 3600,  // serve stale for 1 hour
                tags: ['service_categories', 'public_categories']
            }
        })

        return categories.map(category => this.convertServiceCategoryWithServicesToClient(category))
    }

    static async getServiceCategoriesForAdmin(
        requesterId: string,
        includeInactive: boolean = false
    ): Promise<ServiceCategoryWithServicesAdminClientDTO[]> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can access admin category management')
        }

        const whereClause: Prisma.ServiceCategoryWhereInput = includeInactive
            ? {}
            : {isActive: true}

        const categories = await prisma.serviceCategory.findMany({
            where: whereClause,
            select: SERVICE_CATEGORY_WITH_SERVICES_ADMIN_SELECT,
            orderBy: {name: 'asc'},
            cacheStrategy: {
                ttl: 600,   // 10 minutes for admin categories
                swr: 1200,  // serve stale for 20 minutes
                tags: ['service_categories', 'admin_categories']
            }
        })

        return categories.map(category => this.convertServiceCategoryWithServicesAdminToClient(category))
    }

    static async createServiceCategory(
        requesterId: string,
        categoryData: CreateServiceCategoryInput
    ): Promise<ServiceCategoryClientDTO> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can create service categories')
        }

        // Check for duplicate category name
        const existingCategory = await prisma.serviceCategory.findUnique({
            where: {name: categoryData.name}
        })

        if (existingCategory) {
            throw new Error('Service category with this name already exists')
        }

        return await prisma.serviceCategory.create({
            data: categoryData,
            select: SERVICE_CATEGORY_BASE_SELECT
        })
    }

    static async updateServiceCategory(
        requesterId: string,
        categoryId: string,
        updateData: UpdateServiceCategoryInput
    ): Promise<ServiceCategoryClientDTO> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can update service categories')
        }

        // Verify category exists
        const category = await prisma.serviceCategory.findUnique({
            where: {id: categoryId}
        })

        if (!category) {
            throw new Error('Service category not found')
        }

        // Check for duplicate name if name is being updated
        if (updateData.name && updateData.name !== category.name) {
            const existingCategory = await prisma.serviceCategory.findUnique({
                where: {name: updateData.name}
            })

            if (existingCategory) {
                throw new Error('Service category with this name already exists')
            }
        }

        return await prisma.serviceCategory.update({
            where: {id: categoryId},
            data: updateData,
            select: SERVICE_CATEGORY_BASE_SELECT
        })
    }

    static async deleteServiceCategory(
        requesterId: string,
        categoryId: string
    ): Promise<void> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can delete service categories')
        }

        // Check if category has active services
        const servicesCount = await prisma.service.count({
            where: {
                categoryId,
                isActive: true
            }
        })

        if (servicesCount > 0) {
            throw new Error('Cannot delete category with active services. Deactivate all services first.')
        }

        await prisma.serviceCategory.update({
            where: {id: categoryId},
            data: {isActive: false}
        })
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    static async getServicesByDevice(
        deviceType: DeviceType,
        categoryId?: string
    ): Promise<ServiceWithCategoryClientDTO[]> {
        const whereClause: Prisma.ServiceWhereInput = {
            device: deviceType,
            isActive: true,
            category: {
                isActive: true
            }
        }

        if (categoryId) {
            whereClause.categoryId = categoryId
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            select: SERVICE_WITH_CATEGORY_SELECT,
            orderBy: [{category: {name: 'asc'}}, {name: 'asc'}],
            cacheStrategy: {
                ttl: 900,   // 15 minutes for device-specific services
                swr: 1800,  // serve stale for 30 minutes
                tags: ['services', `device_${deviceType}`, categoryId ? `category_${categoryId}` : 'all_categories']
            }
        }) as unknown as ServiceWithCategoryDTO[]

        return services.map(service => this.convertServiceWithCategoryToClient(service))
    }

    static async getServiceStats(requesterId: string): Promise<ServiceStatsResult> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can view service statistics')
        }

        const [
            totalServices,
            activeServices,
            inactiveServices,
            totalCategories
        ] = await Promise.all([
            prisma.service.count({
                cacheStrategy: {
                    ttl: 600,  // 10 minutes for stats
                    swr: 1200, // serve stale for 20 minutes
                    tags: ['service_stats', 'total_services']
                }
            }),
            prisma.service.count({
                where: {isActive: true},
                cacheStrategy: {
                    ttl: 600,
                    swr: 1200,
                    tags: ['service_stats', 'active_services']
                }
            }),
            prisma.service.count({
                where: {isActive: false},
                cacheStrategy: {
                    ttl: 600,
                    swr: 1200,
                    tags: ['service_stats', 'inactive_services']
                }
            }),
            prisma.serviceCategory.count({
                where: {isActive: true},
                cacheStrategy: {
                    ttl: 600,
                    swr: 1200,
                    tags: ['service_stats', 'total_categories']
                }
            })
        ])

        const deviceStats = await prisma.service.groupBy({
            by: ['device'],
            where: {isActive: true},
            _count: {_all: true},
            cacheStrategy: {
                ttl: 900,   // 15 minutes for device stats
                swr: 1800,  // serve stale for 30 minutes
                tags: ['service_stats', 'device_stats']
            }
        }) as unknown as Array<{ device: DeviceType; _count: { _all: number } }>

        const categoryStats = await prisma.service.groupBy({
            by: ['categoryId'],
            where: {isActive: true},
            _count: {_all: true},
            cacheStrategy: {
                ttl: 900,   // 15 minutes for category stats
                swr: 1800,  // serve stale for 30 minutes
                tags: ['service_stats', 'category_stats']
            }
        }) as unknown as Array<{ categoryId: string; _count: { _all: number } }>

        // Get category names for category stats
        const categoryNames = await prisma.serviceCategory.findMany({
            where: {
                id: {
                    in: categoryStats.map((stat) => stat.categoryId)
                }
            },
            select: {id: true, name: true},
            cacheStrategy: {
                ttl: 1800,  // 30 minutes for category names
                swr: 3600,  // serve stale for 1 hour
                tags: ['service_categories', 'category_names']
            }
        })

        const categoryNameMap = categoryNames.reduce((acc, cat) => {
            acc[cat.id] = cat.name
            return acc
        }, {} as Record<string, string>)

        return {
            totalServices,
            activeServices,
            inactiveServices,
            totalCategories,
            servicesByDevice: deviceStats.map((stat) => ({
                device: stat.device,
                count: stat._count._all
            })),
            servicesByCategory: categoryStats.map((stat) => ({
                categoryName: categoryNameMap[stat.categoryId] || 'Unknown',
                count: stat._count._all
            }))
        }
    }
}