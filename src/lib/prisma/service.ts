import {prisma} from '@/lib/prisma/prisma'
import type {Service, ServiceCategory, Prisma} from '@prisma/client'
import {DeviceType} from '@prisma/client'

// Type for service with included category using Prisma's type utilities
type ServiceWithCategoryRelation = Prisma.ServiceGetPayload<{
    include: { category: true }
}>

// Types for groupBy results
type DeviceGroupByResult = {
    device: DeviceType
    _count: number
}

type CategoryGroupByResult = {
    categoryId: string
    _count: number
}

export type ServiceWithCategory = Omit<Service, 'price'> & {
    category: ServiceCategory
    price: number
}

export type ServiceListItem = {
    id: string
    name: string
    categoryName: string
    device: DeviceType
    price: number
    estimatedTime: string
    isActive: boolean
}

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

// Type for service with converted price for client components
type ServiceForClient = Omit<Service, 'price'> & {
    price: number
}

export type CategoryWithServices = ServiceCategory & {
    services: ServiceForClient[]
    _count: {
        services: number
    }
}

export class ServiceService {
    static async getServiceList(
        filters: ServiceFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ services: ServiceListItem[], total: number }> {
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

        const servicesResult = await prisma.service.findMany({
            where: whereClause,
            include: {
                category: true
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{category: {name: 'asc'}}, {name: 'asc'}]
        }) as ServiceWithCategoryRelation[]
        
        const total = await prisma.service.count({where: whereClause})

        return {
            services: servicesResult.map(service => ({
                id: service.id,
                name: service.name,
                categoryName: service.category.name,
                device: service.device,
                price: Number(service.price),
                estimatedTime: service.estimatedTime,
                isActive: service.isActive
            })),
            total
        }
    }

    // Get service with category details (PUBLIC ACCESS)
    static async getServiceWithCategory(serviceId: string): Promise<ServiceWithCategory | null> {
        const service = await prisma.service.findUnique({
            where: {id: serviceId},
            include: {
                category: true
            }
        })
        
        if (!service) return null
        
        // Convert Decimal to number for client components
        return {
            ...service,
            price: Number(service.price)
        } as ServiceWithCategory
    }

    // Create a new service
    static async createService(
        requesterId: string,
        serviceData: {
            name: string
            categoryId: string
            description?: string
            device: DeviceType
            price: number
            notes?: string
            estimatedTime: string
        }
    ): Promise<ServiceWithCategory> {
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
            data: {
                name: serviceData.name,
                categoryId: serviceData.categoryId,
                description: serviceData.description,
                device: serviceData.device,
                price: serviceData.price,
                notes: serviceData.notes,
                estimatedTime: serviceData.estimatedTime
            },
            include: {
                category: true
            }
        })

        // Convert Decimal to number for client components
        return {
            ...service,
            price: Number(service.price)
        } as ServiceWithCategory
    }

    // Update service
    static async updateService(
        requesterId: string,
        serviceId: string,
        updateData: {
            name?: string
            categoryId?: string
            description?: string
            device?: DeviceType
            price?: number
            notes?: string
            estimatedTime?: string
            isActive?: boolean
        }
    ): Promise<ServiceWithCategory> {
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
            include: {
                category: true
            }
        })

        // Convert Decimal to number for client components
        return {
            ...service,
            price: Number(service.price)
        } as ServiceWithCategory
    }

    // Delete service (soft delete by setting isActive to false)
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

    // Restore service (set isActive to true)
    static async restoreService(
        requesterId: string,
        serviceId: string
    ): Promise<ServiceWithCategory> {
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
            include: {
                category: true
            }
        })

        // Convert Decimal to number for client components
        return {
            ...service,
            price: Number(service.price)
        } as ServiceWithCategory
    }

    // Get all service categories with service counts (PUBLIC ACCESS)
    static async getServiceCategories(
        includeInactive: boolean = false
    ): Promise<CategoryWithServices[]> {
        // No authentication required - public access (but only show active by default)
        const whereClause: Prisma.ServiceCategoryWhereInput = includeInactive
            ? {}
            : {isActive: true}

        const categories = await prisma.serviceCategory.findMany({
            where: whereClause,
            include: {
                services: {
                    where: {isActive: true}
                },
                _count: {
                    select: {
                        services: {
                            where: {isActive: true}
                        }
                    }
                }
            },
            orderBy: {name: 'asc'}
        })

        // Convert Decimal prices to numbers for client components
        return categories.map(category => ({
            ...category,
            services: category.services.map(service => ({
                ...service,
                price: Number(service.price)
            }))
        }))
    }

    // Get all service categories for admin management (includes inactive)
    static async getServiceCategoriesForAdmin(
        requesterId: string,
        includeInactive: boolean = false
    ): Promise<CategoryWithServices[]> {
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
            include: {
                services: includeInactive ? true : {
                    where: {isActive: true}
                },
                _count: {
                    select: {
                        services: includeInactive ? true : {
                            where: {isActive: true}
                        }
                    }
                }
            },
            orderBy: {name: 'asc'}
        })

        // Convert Decimal prices to numbers for client components
        return categories.map(category => ({
            ...category,
            services: category.services.map(service => ({
                ...service,
                price: Number(service.price)
            }))
        }))
    }

    // Create service category
    static async createServiceCategory(
        requesterId: string,
        categoryData: {
            name: string
            description?: string
        }
    ): Promise<ServiceCategory> {
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
            data: categoryData
        })
    }

    // Update service category
    static async updateServiceCategory(
        requesterId: string,
        categoryId: string,
        updateData: {
            name?: string
            description?: string
            isActive?: boolean
        }
    ): Promise<ServiceCategory> {
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
            data: updateData
        })
    }

    // Delete service category (only if no active services)
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

    // Get services by device type (for customer-facing operations)
    static async getServicesByDevice(
        deviceType: DeviceType,
        categoryId?: string
    ): Promise<ServiceWithCategory[]> {
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
            include: {
                category: true
            },
            orderBy: [{category: {name: 'asc'}}, {name: 'asc'}]
        })

        // Convert Decimal to number for client components
        return services.map(service => ({
            ...service,
            price: Number(service.price)
        })) as ServiceWithCategory[]
    }

    // Get service statistics
    static async getServiceStats(requesterId: string): Promise<{
        totalServices: number
        activeServices: number
        inactiveServices: number
        totalCategories: number
        servicesByDevice: { device: DeviceType, count: number }[]
        servicesByCategory: { categoryName: string, count: number }[]
    }> {
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
            prisma.service.count(),
            prisma.service.count({where: {isActive: true}}),
            prisma.service.count({where: {isActive: false}}),
            prisma.serviceCategory.count({where: {isActive: true}})
        ])
        
        const deviceStats = await prisma.service.groupBy({
            by: ['device'],
            where: {isActive: true},
            _count: true
        }) as DeviceGroupByResult[]
        
        const categoryStats = await prisma.service.groupBy({
            by: ['categoryId'],
            where: {isActive: true},
            _count: true
        }) as CategoryGroupByResult[]

        // Get category names for category stats
        const categoryNames = await prisma.serviceCategory.findMany({
            where: {
                id: {
                    in: categoryStats.map(stat => stat.categoryId)
                }
            },
            select: {id: true, name: true}
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
            servicesByDevice: deviceStats.map(stat => ({
                device: stat.device,
                count: stat._count
            })),
            servicesByCategory: categoryStats.map(stat => ({
                categoryName: categoryNameMap[stat.categoryId] || 'Unknown',
                count: stat._count
            }))
        }
    }
}