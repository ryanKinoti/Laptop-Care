'use server'

import {getAuthenticatedUser} from '@/lib/auth'
import {ServiceService} from '@/lib/prisma/service'
import type {
    ServiceFilters,
    ServiceWithCategoryClientDTO,
    ServiceListClientDTO,
    ServiceCategoryWithServicesClientDTO,
    ServiceCategoryClientDTO,
    ServiceStatsResult,
    CreateServiceInput,
    UpdateServiceInput,
    CreateServiceCategoryInput,
    UpdateServiceCategoryInput
} from '@/types/service'
import {revalidatePath} from 'next/cache'
import {DeviceType} from '@prisma/client'
import {ActionResult} from "@/types/common";

// Service Management Actions

export async function getServiceListAction(
    filters: ServiceFilters = {},
    page: number = 1,
    limit: number = 20
): Promise<ActionResult<{ services: ServiceListClientDTO[], total: number }>> {
    try {
        const result = await ServiceService.getServiceList(filters, page, limit)

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Get service list error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch services'
        }
    }
}

export async function getServiceWithCategoryAction(
    serviceId: string
): Promise<ActionResult<ServiceWithCategoryClientDTO>> {
    try {
        const service = await ServiceService.getServiceWithCategory(serviceId)

        if (!service) {
            return {
                success: false,
                error: 'Service not found'
            }
        }

        return {
            success: true,
            data: service
        }
    } catch (error) {
        console.error('Get service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch service'
        }
    }
}

export async function createServiceAction(serviceData: CreateServiceInput): Promise<ActionResult<ServiceWithCategoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const service = await ServiceService.createService(requesterId, serviceData)

        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/services/categories')

        return {
            success: true,
            data: service
        }
    } catch (error) {
        console.error('Create service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create service'
        }
    }
}

export async function updateServiceAction(
    serviceId: string,
    updateData: UpdateServiceInput
): Promise<ActionResult<ServiceWithCategoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const service = await ServiceService.updateService(requesterId, serviceId, updateData)

        revalidatePath('/dashboard/services')
        revalidatePath(`/dashboard/services/${serviceId}`)
        revalidatePath('/dashboard/services/categories')

        return {
            success: true,
            data: service
        }
    } catch (error) {
        console.error('Update service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update service'
        }
    }
}

export async function deleteServiceAction(
    serviceId: string
): Promise<ActionResult> {
    try {
        const requesterId = await getAuthenticatedUser()
        await ServiceService.deleteService(requesterId, serviceId)

        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/services/categories')

        return {
            success: true
        }
    } catch (error) {
        console.error('Delete service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete service'
        }
    }
}

export async function restoreServiceAction(
    serviceId: string
): Promise<ActionResult<ServiceWithCategoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const service = await ServiceService.restoreService(requesterId, serviceId)

        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/services/categories')

        return {
            success: true,
            data: service
        }
    } catch (error) {
        console.error('Restore service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to restore service'
        }
    }
}

// Service Category Management Actions

export async function getServiceCategoriesAction(
    includeInactive: boolean = false
): Promise<ActionResult<ServiceCategoryWithServicesClientDTO[]>> {
    try {
        // No authentication required - public access
        const categories = await ServiceService.getServiceCategories(includeInactive)

        return {
            success: true,
            data: categories
        }
    } catch (error) {
        console.error('Get service categories error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch service categories'
        }
    }
}

export async function getServiceCategoriesForAdminAction(
    includeInactive: boolean = false
): Promise<ActionResult<ServiceCategoryWithServicesClientDTO[]>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const categories = await ServiceService.getServiceCategoriesForAdmin(requesterId, includeInactive)

        return {
            success: true,
            data: categories
        }
    } catch (error) {
        console.error('Get service categories for admin error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch service categories for admin'
        }
    }
}

export async function createServiceCategoryAction(categoryData: CreateServiceCategoryInput): Promise<ActionResult<ServiceCategoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const category = await ServiceService.createServiceCategory(requesterId, categoryData)

        revalidatePath('/dashboard/services/categories')
        revalidatePath('/dashboard/services')

        return {
            success: true,
            data: category
        }
    } catch (error) {
        console.error('Create service category error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create service category'
        }
    }
}

export async function updateServiceCategoryAction(
    categoryId: string,
    updateData: UpdateServiceCategoryInput
): Promise<ActionResult<ServiceCategoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const category = await ServiceService.updateServiceCategory(requesterId, categoryId, updateData)

        revalidatePath('/dashboard/services/categories')
        revalidatePath('/dashboard/services')

        return {
            success: true,
            data: category
        }
    } catch (error) {
        console.error('Update service category error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update service category'
        }
    }
}

export async function deleteServiceCategoryAction(
    categoryId: string
): Promise<ActionResult> {
    try {
        const requesterId = await getAuthenticatedUser()
        await ServiceService.deleteServiceCategory(requesterId, categoryId)

        revalidatePath('/dashboard/services/categories')
        revalidatePath('/dashboard/services')

        return {
            success: true
        }
    } catch (error) {
        console.error('Delete service category error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete service category'
        }
    }
}

// Customer-Facing Actions

export async function getServicesByDeviceAction(
    deviceType: DeviceType,
    categoryId?: string
): Promise<ActionResult<ServiceWithCategoryClientDTO[]>> {
    try {
        const services = await ServiceService.getServicesByDevice(deviceType, categoryId)

        return {
            success: true,
            data: services
        }
    } catch (error) {
        console.error('Get services by device error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch services'
        }
    }
}

// Administrative Actions

export async function getServiceStatsAction(): Promise<ActionResult<ServiceStatsResult>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const stats = await ServiceService.getServiceStats(requesterId)

        return {
            success: true,
            data: stats
        }
    } catch (error) {
        console.error('Get service stats error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch service statistics'
        }
    }
}

// Bulk Operations

export async function bulkUpdateServicesAction(
    serviceIds: string[],
    updateData: {
        isActive?: boolean
        categoryId?: string
    }
): Promise<ActionResult<{ updated: number }>> {
    try {
        const requesterId = await getAuthenticatedUser()

        let updatedCount = 0
        for (const serviceId of serviceIds) {
            try {
                await ServiceService.updateService(requesterId, serviceId, updateData)
                updatedCount++
            } catch (error) {
                console.error(`Failed to update service ${serviceId}:`, error)
                // Continue with other services
            }
        }

        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/services/categories')

        return {
            success: true,
            data: {updated: updatedCount}
        }
    } catch (error) {
        console.error('Bulk update services error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to bulk update services'
        }
    }
}

export async function duplicateServiceAction(
    serviceId: string,
    newData: {
        name: string
        device?: DeviceType
        categoryId?: string
    }
): Promise<ActionResult<ServiceWithCategoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()

        // Get the original service
        const originalService = await ServiceService.getServiceWithCategory(serviceId)
        if (!originalService) {
            throw new Error('Original service not found')
        }

        // Create new service with original data but new name, device, and/or category
        const serviceData = {
            name: newData.name,
            categoryId: newData.categoryId || originalService.categoryId,
            description: originalService.description || undefined,
            device: newData.device || originalService.device,
            price: Number(originalService.price),
            notes: originalService.notes || undefined,
            estimatedTime: originalService.estimatedTime
        }

        const duplicatedService = await ServiceService.createService(requesterId, serviceData)

        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/services/categories')

        return {
            success: true,
            data: duplicatedService
        }
    } catch (error) {
        console.error('Duplicate service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to duplicate service'
        }
    }
}