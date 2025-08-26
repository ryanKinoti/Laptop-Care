'use server'

import {getAuthenticatedUser} from '@/lib/auth'
import {InventoryService} from '@/lib/prisma/inventory'
import {
    type DeviceListClientDTO,
    type DeviceWithRelationsClientDTO,
    type DevicePartListClientDTO,
    type DevicePartWithRelationsClientDTO,
    type PartMovementListClientDTO,
    type PartMovementWithRelationsClientDTO,
    type RepairHistoryClientDTO,
    type CreateDeviceInput,
    type UpdateDeviceInput,
    type CreateDevicePartInput,
    type UpdateDevicePartInput,
    type CreatePartMovementInput,
    type CreateRepairHistoryInput,
    type DeviceFilters,
    type DevicePartFilters,
    type PartMovementFilters
} from '@/types/inventory'
import {revalidatePath} from 'next/cache'
import {DeviceRepairStatus, SaleStatus, DevicePartStatus} from '@prisma/client'
import {ActionResult} from "@/types/common"

// =============================================================================
// DEVICE ACTIONS
// =============================================================================

export async function getDeviceListAction(
    filters: DeviceFilters = {},
    page: number = 1,
    limit: number = 20
): Promise<ActionResult<{ devices: DeviceListClientDTO[], total: number }>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const result = await InventoryService.getDeviceList(requesterId, filters, page, limit)

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Get device list error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch devices'
        }
    }
}

export async function getDeviceWithRelationsAction(
    deviceId: string
): Promise<ActionResult<DeviceWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const device = await InventoryService.getDeviceWithRelations(requesterId, deviceId)

        if (!device) {
            return {
                success: false,
                error: 'Device not found'
            }
        }

        return {
            success: true,
            data: device
        }
    } catch (error) {
        console.error('Get device details error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch device details'
        }
    }
}

export async function createDeviceAction(
    deviceData: CreateDeviceInput
): Promise<ActionResult<DeviceWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const device = await InventoryService.createDevice(requesterId, deviceData)

        revalidatePath('/dashboard/inventory/devices')

        return {
            success: true,
            data: device
        }
    } catch (error) {
        console.error('Create device error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create device'
        }
    }
}

export async function updateDeviceAction(
    deviceId: string,
    updateData: UpdateDeviceInput
): Promise<ActionResult<DeviceWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const device = await InventoryService.updateDevice(requesterId, deviceId, updateData)

        revalidatePath('/dashboard/inventory/devices')
        revalidatePath(`/dashboard/inventory/devices/${deviceId}`)

        return {
            success: true,
            data: device
        }
    } catch (error) {
        console.error('Update device error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update device'
        }
    }
}

export async function deleteDeviceAction(
    deviceId: string
): Promise<ActionResult> {
    try {
        const requesterId = await getAuthenticatedUser()
        await InventoryService.deleteDevice(requesterId, deviceId)

        revalidatePath('/dashboard/inventory/devices')

        return {
            success: true
        }
    } catch (error) {
        console.error('Delete device error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete device'
        }
    }
}

// =============================================================================
// DEVICE PART ACTIONS
// =============================================================================

export async function getDevicePartsListAction(
    filters: DevicePartFilters = {},
    page: number = 1,
    limit: number = 20
): Promise<ActionResult<{ parts: DevicePartListClientDTO[], total: number }>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const result = await InventoryService.getDevicePartsList(requesterId, filters, page, limit)

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Get device parts list error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch device parts'
        }
    }
}

export async function getDevicePartWithRelationsAction(
    partId: string
): Promise<ActionResult<DevicePartWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const part = await InventoryService.getDevicePartWithRelations(requesterId, partId)

        if (!part) {
            return {
                success: false,
                error: 'Part not found'
            }
        }

        return {
            success: true,
            data: part
        }
    } catch (error) {
        console.error('Get device part details error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch part details'
        }
    }
}

export async function createDevicePartAction(
    partData: CreateDevicePartInput
): Promise<ActionResult<DevicePartWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const part = await InventoryService.createDevicePart(requesterId, partData)

        revalidatePath('/dashboard/inventory/parts')

        return {
            success: true,
            data: part
        }
    } catch (error) {
        console.error('Create device part error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create part'
        }
    }
}

export async function updateDevicePartAction(
    partId: string,
    updateData: UpdateDevicePartInput
): Promise<ActionResult<DevicePartWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const part = await InventoryService.updateDevicePart(requesterId, partId, updateData)

        revalidatePath('/dashboard/inventory/parts')
        revalidatePath(`/dashboard/inventory/parts/${partId}`)

        return {
            success: true,
            data: part
        }
    } catch (error) {
        console.error('Update device part error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update part'
        }
    }
}

export async function deleteDevicePartAction(
    partId: string
): Promise<ActionResult> {
    try {
        const requesterId = await getAuthenticatedUser()
        await InventoryService.deleteDevicePart(requesterId, partId)

        revalidatePath('/dashboard/inventory/parts')

        return {
            success: true
        }
    } catch (error) {
        console.error('Delete device part error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete part'
        }
    }
}

// =============================================================================
// PART MOVEMENT ACTIONS
// =============================================================================

export async function getPartMovementsListAction(
    filters: PartMovementFilters = {},
    page: number = 1,
    limit: number = 20
): Promise<ActionResult<{ movements: PartMovementListClientDTO[], total: number }>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const result = await InventoryService.getPartMovementsList(requesterId, filters, page, limit)

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Get part movements list error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch part movements'
        }
    }
}

export async function createPartMovementAction(
    movementData: CreatePartMovementInput
): Promise<ActionResult<PartMovementWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const movement = await InventoryService.createPartMovement(requesterId, movementData)

        revalidatePath('/dashboard/inventory/movements')
        revalidatePath(`/dashboard/inventory/parts/${movementData.partId}`)

        return {
            success: true,
            data: movement
        }
    } catch (error) {
        console.error('Create part movement error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create part movement'
        }
    }
}

// =============================================================================
// REPAIR HISTORY ACTIONS
// =============================================================================

export async function createRepairHistoryAction(
    repairData: CreateRepairHistoryInput
): Promise<ActionResult<RepairHistoryClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const repairHistory = await InventoryService.createRepairHistory(requesterId, repairData)

        revalidatePath('/dashboard/inventory/devices')
        revalidatePath(`/dashboard/inventory/devices/${repairData.deviceId}`)
        revalidatePath('/dashboard/repairs')

        return {
            success: true,
            data: repairHistory
        }
    } catch (error) {
        console.error('Create repair history error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create repair history'
        }
    }
}

// =============================================================================
// INVENTORY STATISTICS ACTIONS
// =============================================================================

export async function getInventoryStatsAction(): Promise<ActionResult<{
    totalDevices: number
    devicesInRepair: number
    devicesForSale: number
    soldDevices: number
    totalParts: number
    partsInStock: number
    partsOutOfStock: number
    recentMovements: number
}>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const stats = await InventoryService.getInventoryStats(requesterId)

        return {
            success: true,
            data: stats
        }
    } catch (error) {
        console.error('Get inventory stats error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch inventory statistics'
        }
    }
}

// =============================================================================
// UTILITY ACTIONS
// =============================================================================

export async function updateDeviceRepairStatusAction(
    deviceId: string,
    repairStatus: DeviceRepairStatus
): Promise<ActionResult<DeviceWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const device = await InventoryService.updateDevice(requesterId, deviceId, {repairStatus})

        revalidatePath('/dashboard/inventory/devices')
        revalidatePath(`/dashboard/inventory/devices/${deviceId}`)
        revalidatePath('/dashboard/repairs')

        return {
            success: true,
            data: device
        }
    } catch (error) {
        console.error('Update device repair status error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update repair status'
        }
    }
}

export async function updateDeviceSaleStatusAction(
    deviceId: string,
    saleStatus: SaleStatus
): Promise<ActionResult<DeviceWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const device = await InventoryService.updateDevice(requesterId, deviceId, {saleStatus})

        revalidatePath('/dashboard/inventory/devices')
        revalidatePath(`/dashboard/inventory/devices/${deviceId}`)
        revalidatePath('/dashboard/sales')

        return {
            success: true,
            data: device
        }
    } catch (error) {
        console.error('Update device sale status error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update sale status'
        }
    }
}

export async function updatePartStatusAction(
    partId: string,
    status: DevicePartStatus
): Promise<ActionResult<DevicePartWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const part = await InventoryService.updateDevicePart(requesterId, partId, {status})

        revalidatePath('/dashboard/inventory/parts')
        revalidatePath(`/dashboard/inventory/parts/${partId}`)

        return {
            success: true,
            data: part
        }
    } catch (error) {
        console.error('Update part status error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update part status'
        }
    }
}

export async function assignDeviceToCustomerAction(
    deviceId: string,
    customerId: string | null
): Promise<ActionResult<DeviceWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const device = await InventoryService.updateDevice(requesterId, deviceId, {customerId})

        revalidatePath('/dashboard/inventory/devices')
        revalidatePath(`/dashboard/inventory/devices/${deviceId}`)
        if (customerId) {
            revalidatePath(`/dashboard/customers/${customerId}`)
        }

        return {
            success: true,
            data: device
        }
    } catch (error) {
        console.error('Assign device to customer error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign device to customer'
        }
    }
}

export async function assignPartToDeviceAction(
    partId: string,
    customerDeviceId: string | null
): Promise<ActionResult<DevicePartWithRelationsClientDTO>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const part = await InventoryService.updateDevicePart(requesterId, partId, {customerDeviceId})

        revalidatePath('/dashboard/inventory/parts')
        revalidatePath(`/dashboard/inventory/parts/${partId}`)
        if (customerDeviceId) {
            revalidatePath(`/dashboard/inventory/devices/${customerDeviceId}`)
        }

        return {
            success: true,
            data: part
        }
    } catch (error) {
        console.error('Assign part to device error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign part to device'
        }
    }
}