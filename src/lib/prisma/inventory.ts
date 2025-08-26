import {prisma} from '@/lib/prisma/prisma'
import type {Prisma} from '@prisma/client'
import {
    // Select constants
    DEVICE_LIST_SELECT,
    DEVICE_WITH_RELATIONS_SELECT,
    DEVICE_PART_LIST_SELECT,
    DEVICE_PART_WITH_RELATIONS_SELECT,
    PART_MOVEMENT_LIST_SELECT,
    PART_MOVEMENT_WITH_RELATIONS_SELECT,
    REPAIR_HISTORY_SELECT,
    // DTO types
    type DeviceListDTO,
    type DeviceWithRelationsDTO,
    type DevicePartListDTO,
    type DevicePartWithRelationsDTO,
    type PartMovementListDTO,
    type RepairHistoryDTO,
    // Client-safe types
    type DeviceListClientDTO,
    type DeviceWithRelationsClientDTO,
    type DevicePartListClientDTO,
    type DevicePartWithRelationsClientDTO,
    type PartMovementListClientDTO,
    type PartMovementWithRelationsClientDTO,
    type RepairHistoryClientDTO,
    // Input types
    type CreateDeviceInput,
    type UpdateDeviceInput,
    type CreateDevicePartInput,
    type UpdateDevicePartInput,
    type CreatePartMovementInput,
    type CreateRepairHistoryInput,
    // Filter types
    type DeviceFilters,
    type DevicePartFilters,
    type PartMovementFilters
} from '@/types/inventory'

export class InventoryService {
    // =============================================================================
    // PRIVATE HELPER METHODS - Decimal conversion
    // =============================================================================

    private static convertDeviceToClient(device: DeviceListDTO): DeviceListClientDTO {
        return {
            ...device,
            price: device.price ? Number(device.price) : null,
            customerName: device.customer?.name || null
        }
    }

    private static convertDeviceWithRelationsToClient(device: DeviceWithRelationsDTO): DeviceWithRelationsClientDTO {
        return {
            ...device,
            price: device.price ? Number(device.price) : null,
            customer: device.customer,
            parts: device.parts?.map(part => ({
                ...part,
                price: part.price ? Number(part.price) : null
            })),
            repairHistory: device.repairHistory?.map(history => ({
                ...history,
                partsUsed: history.partsUsed.map(part => ({
                    ...part,
                    price: part.price ? Number(part.price) : null
                }))
            }))
        }
    }

    private static convertDevicePartToClient(part: DevicePartListDTO): DevicePartListClientDTO {
        return {
            ...part,
            price: part.price ? Number(part.price) : null,
            customerName: part.customerDevice?.customer?.name || null
        }
    }

    private static convertDevicePartWithRelationsToClient(part: DevicePartWithRelationsDTO): DevicePartWithRelationsClientDTO {
        return {
            ...part,
            price: part.price ? Number(part.price) : null,
            customerDevice: part.customerDevice,
            movements: part.movements
        }
    }

    private static convertPartMovementToClient(movement: PartMovementListDTO): PartMovementListClientDTO {
        return {
            ...movement,
            partName: movement.part.name,
            partModel: movement.part.model,
            createdByName: movement.createdBy?.name || null
        }
    }

    private static convertRepairHistoryToClient(history: RepairHistoryDTO): RepairHistoryClientDTO {
        return {
            ...history,
            partsUsed: history.partsUsed.map(part => ({
                ...part,
                price: part.price ? Number(part.price) : null
            }))
        }
    }

    // =============================================================================
    // DEVICE OPERATIONS
    // =============================================================================

    static async getDeviceList(
        requesterId: string,
        filters: DeviceFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ devices: DeviceListClientDTO[], total: number }> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can access device inventory')
        }

        // Build where clause
        const whereClause: Prisma.DeviceWhereInput = {}

        if (filters.search) {
            whereClause.OR = [
                {brand: {contains: filters.search, mode: 'insensitive'}},
                {model: {contains: filters.search, mode: 'insensitive'}},
                {serialNumber: {contains: filters.search, mode: 'insensitive'}},
                {customer: {name: {contains: filters.search, mode: 'insensitive'}}}
            ]
        }

        if (filters.deviceType) {
            whereClause.deviceType = filters.deviceType
        }

        if (filters.repairStatus) {
            whereClause.repairStatus = filters.repairStatus
        }

        if (filters.saleStatus) {
            whereClause.saleStatus = filters.saleStatus
        }

        if (filters.customerId) {
            whereClause.customerId = filters.customerId
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

        const [devices, total] = await Promise.all([
            prisma.device.findMany({
                where: whereClause,
                select: DEVICE_LIST_SELECT,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {createdAt: 'desc'},
                cacheStrategy: {
                    ttl: 300,   // 5 minutes for device lists
                    swr: 600,   // serve stale for 10 minutes
                    tags: ['devices', 'device_list']
                }
            }),
            prisma.device.count({
                where: whereClause,
                cacheStrategy: {
                    ttl: 300,
                    swr: 600,
                    tags: ['devices', 'device_count']
                }
            })
        ])

        return {
            devices: devices.map(device => this.convertDeviceToClient(device)),
            total
        }
    }

    static async getDeviceWithRelations(
        requesterId: string,
        deviceId: string
    ): Promise<DeviceWithRelationsClientDTO | null> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can access device details')
        }

        const device = await prisma.device.findUnique({
            where: {id: deviceId},
            select: DEVICE_WITH_RELATIONS_SELECT,
            cacheStrategy: {
                ttl: 600,   // 10 minutes for device details
                swr: 1200,  // serve stale for 20 minutes
                tags: ['devices', `device_${deviceId}`, 'device_details']
            }
        })

        if (!device) return null

        return this.convertDeviceWithRelationsToClient(device)
    }

    static async createDevice(
        requesterId: string,
        deviceData: CreateDeviceInput
    ): Promise<DeviceWithRelationsClientDTO> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can create devices')
        }

        // Check for duplicate serial number
        const existingDevice = await prisma.device.findUnique({
            where: {serialNumber: deviceData.serialNumber}
        })

        if (existingDevice) {
            throw new Error('Device with this serial number already exists')
        }

        // Verify customer exists if provided
        if (deviceData.customerId) {
            const customer = await prisma.user.findUnique({
                where: {id: deviceData.customerId, isStaff: false}
            })

            if (!customer) {
                throw new Error('Customer not found')
            }
        }

        const device = await prisma.device.create({
            data: deviceData,
            select: DEVICE_WITH_RELATIONS_SELECT
        })

        return this.convertDeviceWithRelationsToClient(device)
    }

    static async updateDevice(
        requesterId: string,
        deviceId: string,
        updateData: UpdateDeviceInput
    ): Promise<DeviceWithRelationsClientDTO> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can update devices')
        }

        // Verify device exists
        const existingDevice = await prisma.device.findUnique({
            where: {id: deviceId}
        })

        if (!existingDevice) {
            throw new Error('Device not found')
        }

        // Check for duplicate serial number if being updated
        if (updateData.serialNumber && updateData.serialNumber !== existingDevice.serialNumber) {
            const duplicateDevice = await prisma.device.findUnique({
                where: {serialNumber: updateData.serialNumber}
            })

            if (duplicateDevice) {
                throw new Error('Device with this serial number already exists')
            }
        }

        // Verify customer exists if provided
        if (updateData.customerId) {
            const customer = await prisma.user.findUnique({
                where: {id: updateData.customerId, isStaff: false}
            })

            if (!customer) {
                throw new Error('Customer not found')
            }
        }

        const device = await prisma.device.update({
            where: {id: deviceId},
            data: updateData,
            select: DEVICE_WITH_RELATIONS_SELECT
        })

        return this.convertDeviceWithRelationsToClient(device)
    }

    static async deleteDevice(
        requesterId: string,
        deviceId: string
    ): Promise<void> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can delete devices')
        }

        // Check if device has associated data
        const [partsCount, repairHistoryCount] = await Promise.all([
            prisma.devicePart.count({where: {customerDeviceId: deviceId}}),
            prisma.repairHistory.count({where: {deviceId}})
        ])

        if (partsCount > 0 || repairHistoryCount > 0) {
            throw new Error('Cannot delete device with associated parts or repair history')
        }

        await prisma.device.delete({
            where: {id: deviceId}
        })
    }

    // =============================================================================
    // DEVICE PART OPERATIONS
    // =============================================================================

    static async getDevicePartsList(
        requesterId: string,
        filters: DevicePartFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ parts: DevicePartListClientDTO[], total: number }> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can access parts inventory')
        }

        // Build where clause
        const whereClause: Prisma.DevicePartWhereInput = {}

        if (filters.search) {
            whereClause.OR = [
                {name: {contains: filters.search, mode: 'insensitive'}},
                {model: {contains: filters.search, mode: 'insensitive'}},
                {serialNumber: {contains: filters.search, mode: 'insensitive'}}
            ]
        }

        if (filters.status) {
            whereClause.status = filters.status
        }

        if (filters.customerDeviceId) {
            whereClause.customerDeviceId = filters.customerDeviceId
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

        if (filters.quantityRange) {
            whereClause.quantity = {}
            if (filters.quantityRange.min !== undefined) {
                whereClause.quantity.gte = filters.quantityRange.min
            }
            if (filters.quantityRange.max !== undefined) {
                whereClause.quantity.lte = filters.quantityRange.max
            }
        }

        const [parts, total] = await Promise.all([
            prisma.devicePart.findMany({
                where: whereClause,
                select: DEVICE_PART_LIST_SELECT,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {createdAt: 'desc'},
                cacheStrategy: {
                    ttl: 240,   // 4 minutes for parts lists
                    swr: 480,   // serve stale for 8 minutes
                    tags: ['parts', 'part_list']
                }
            }),
            prisma.devicePart.count({
                where: whereClause,
                cacheStrategy: {
                    ttl: 240,
                    swr: 480,
                    tags: ['parts', 'part_count']
                }
            })
        ])

        return {
            parts: parts.map(part => this.convertDevicePartToClient(part)),
            total
        }
    }

    static async getDevicePartWithRelations(
        requesterId: string,
        partId: string
    ): Promise<DevicePartWithRelationsClientDTO | null> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can access part details')
        }

        const part = await prisma.devicePart.findUnique({
            where: {id: partId},
            select: DEVICE_PART_WITH_RELATIONS_SELECT,
            cacheStrategy: {
                ttl: 480,   // 8 minutes for part details
                swr: 960,   // serve stale for 16 minutes
                tags: ['parts', `part_${partId}`, 'part_details']
            }
        })

        if (!part) return null

        return this.convertDevicePartWithRelationsToClient(part)
    }

    static async createDevicePart(
        requesterId: string,
        partData: CreateDevicePartInput
    ): Promise<DevicePartWithRelationsClientDTO> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can create parts')
        }

        // Check for duplicate serial number
        const existingPart = await prisma.devicePart.findUnique({
            where: {serialNumber: partData.serialNumber}
        })

        if (existingPart) {
            throw new Error('Part with this serial number already exists')
        }

        // Verify customer device exists if provided
        if (partData.customerDeviceId) {
            const device = await prisma.device.findUnique({
                where: {id: partData.customerDeviceId}
            })

            if (!device) {
                throw new Error('Customer device not found')
            }
        }

        const part = await prisma.devicePart.create({
            data: partData,
            select: DEVICE_PART_WITH_RELATIONS_SELECT
        })

        return this.convertDevicePartWithRelationsToClient(part)
    }

    static async updateDevicePart(
        requesterId: string,
        partId: string,
        updateData: UpdateDevicePartInput
    ): Promise<DevicePartWithRelationsClientDTO> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can update parts')
        }

        // Verify part exists
        const existingPart = await prisma.devicePart.findUnique({
            where: {id: partId}
        })

        if (!existingPart) {
            throw new Error('Part not found')
        }

        // Check for duplicate serial number if being updated
        if (updateData.serialNumber && updateData.serialNumber !== existingPart.serialNumber) {
            const duplicatePart = await prisma.devicePart.findUnique({
                where: {serialNumber: updateData.serialNumber}
            })

            if (duplicatePart) {
                throw new Error('Part with this serial number already exists')
            }
        }

        // Verify customer device exists if provided
        if (updateData.customerDeviceId) {
            const device = await prisma.device.findUnique({
                where: {id: updateData.customerDeviceId}
            })

            if (!device) {
                throw new Error('Customer device not found')
            }
        }

        const part = await prisma.devicePart.update({
            where: {id: partId},
            data: updateData,
            select: DEVICE_PART_WITH_RELATIONS_SELECT
        })

        return this.convertDevicePartWithRelationsToClient(part)
    }

    static async deleteDevicePart(
        requesterId: string,
        partId: string
    ): Promise<void> {
        // Verify requester has admin permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        const isAdmin = requester?.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can delete parts')
        }

        // Check if part has movements
        const movementsCount = await prisma.partMovement.count({
            where: {partId}
        })

        if (movementsCount > 0) {
            throw new Error('Cannot delete part with movement history')
        }

        await prisma.devicePart.delete({
            where: {id: partId}
        })
    }

    // =============================================================================
    // PART MOVEMENT OPERATIONS
    // =============================================================================

    static async getPartMovementsList(
        requesterId: string,
        filters: PartMovementFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ movements: PartMovementListClientDTO[], total: number }> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can access part movements')
        }

        // Build where clause
        const whereClause: Prisma.PartMovementWhereInput = {}

        if (filters.partId) {
            whereClause.partId = filters.partId
        }

        if (filters.movementType) {
            whereClause.movementType = filters.movementType
        }

        if (filters.createdById) {
            whereClause.createdById = filters.createdById
        }

        if (filters.dateRange) {
            whereClause.createdAt = {}
            if (filters.dateRange.from) {
                whereClause.createdAt.gte = filters.dateRange.from
            }
            if (filters.dateRange.to) {
                whereClause.createdAt.lte = filters.dateRange.to
            }
        }

        const [movements, total] = await Promise.all([
            prisma.partMovement.findMany({
                where: whereClause,
                select: PART_MOVEMENT_LIST_SELECT,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {createdAt: 'desc'},
                cacheStrategy: {
                    ttl: 120,   // 2 minutes for movement lists (more dynamic)
                    swr: 240,   // serve stale for 4 minutes
                    tags: ['movements', 'movement_list']
                }
            }),
            prisma.partMovement.count({
                where: whereClause,
                cacheStrategy: {
                    ttl: 120,
                    swr: 240,
                    tags: ['movements', 'movement_count']
                }
            })
        ])

        return {
            movements: movements.map(movement => this.convertPartMovementToClient(movement)),
            total
        }
    }

    static async createPartMovement(
        requesterId: string,
        movementData: CreatePartMovementInput
    ): Promise<PartMovementWithRelationsClientDTO> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can create part movements')
        }

        // Verify part exists
        const part = await prisma.devicePart.findUnique({
            where: {id: movementData.partId}
        })

        if (!part) {
            throw new Error('Part not found')
        }

        const movement = await prisma.partMovement.create({
            data: {
                ...movementData,
                createdById: requesterId
            },
            select: PART_MOVEMENT_WITH_RELATIONS_SELECT
        })

        return movement
    }

    // =============================================================================
    // REPAIR HISTORY OPERATIONS
    // =============================================================================

    static async createRepairHistory(
        requesterId: string,
        repairData: CreateRepairHistoryInput
    ): Promise<RepairHistoryClientDTO> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can create repair history')
        }

        // Verify device exists
        const device = await prisma.device.findUnique({
            where: {id: repairData.deviceId}
        })

        if (!device) {
            throw new Error('Device not found')
        }

        // Verify technician exists if provided
        if (repairData.technicianId) {
            const technician = await prisma.staffProfile.findUnique({
                where: {id: repairData.technicianId}
            })

            if (!technician || technician.role !== 'TECHNICIAN') {
                throw new Error('Invalid technician')
            }
        }

        const repairHistory = await prisma.repairHistory.create({
            data: {
                deviceId: repairData.deviceId,
                bookingId: repairData.bookingId,
                technicianId: repairData.technicianId,
                diagnosis: repairData.diagnosis,
                partsUsed: repairData.partsUsedIds ? {
                    connect: repairData.partsUsedIds.map(id => ({id}))
                } : undefined
            },
            select: REPAIR_HISTORY_SELECT
        })

        return this.convertRepairHistoryToClient(repairHistory)
    }

    // =============================================================================
    // STATISTICS
    // =============================================================================

    static async getInventoryStats(requesterId: string): Promise<{
        totalDevices: number
        devicesInRepair: number
        devicesForSale: number
        soldDevices: number
        totalParts: number
        partsInStock: number
        partsOutOfStock: number
        recentMovements: number
    }> {
        // Verify requester has staff permissions
        const requester = await prisma.user.findUnique({
            where: {id: requesterId},
            include: {staffProfile: true}
        })

        if (!requester?.isStaff) {
            throw new Error('Only staff members can view inventory statistics')
        }

        const [
            totalDevices,
            devicesInRepair,
            devicesForSale,
            soldDevices,
            totalParts,
            partsInStock,
            partsOutOfStock,
            recentMovements
        ] = await Promise.all([
            prisma.device.count({
                cacheStrategy: {
                    ttl: 600,   // 10 minutes for inventory stats
                    swr: 1200,  // serve stale for 20 minutes
                    tags: ['inventory_stats', 'total_devices']
                }
            }),
            prisma.device.count({
                where: {repairStatus: {in: ['PENDING_START', 'IN_PROGRESS', 'AWAITING_PARTS']}},
                cacheStrategy: {
                    ttl: 300,   // 5 minutes for repair status (more dynamic)
                    swr: 600,
                    tags: ['inventory_stats', 'devices_in_repair']
                }
            }),
            prisma.device.count({
                where: {saleStatus: 'AVAILABLE'},
                cacheStrategy: {
                    ttl: 300,
                    swr: 600,
                    tags: ['inventory_stats', 'devices_for_sale']
                }
            }),
            prisma.device.count({
                where: {saleStatus: 'SOLD'},
                cacheStrategy: {
                    ttl: 600,
                    swr: 1200,
                    tags: ['inventory_stats', 'sold_devices']
                }
            }),
            prisma.devicePart.count({
                cacheStrategy: {
                    ttl: 600,
                    swr: 1200,
                    tags: ['inventory_stats', 'total_parts']
                }
            }),
            prisma.devicePart.count({
                where: {status: 'IN_STOCK'},
                cacheStrategy: {
                    ttl: 180,   // 3 minutes for stock status (highly dynamic)
                    swr: 360,
                    tags: ['inventory_stats', 'parts_in_stock']
                }
            }),
            prisma.devicePart.count({
                where: {status: 'OUT_OF_STOCK'},
                cacheStrategy: {
                    ttl: 180,
                    swr: 360,
                    tags: ['inventory_stats', 'parts_out_of_stock']
                }
            }),
            prisma.partMovement.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                },
                cacheStrategy: {
                    ttl: 300,
                    swr: 600,
                    tags: ['inventory_stats', 'recent_movements']
                }
            })
        ])

        return {
            totalDevices,
            devicesInRepair,
            devicesForSale,
            soldDevices,
            totalParts,
            partsInStock,
            partsOutOfStock,
            recentMovements
        }
    }
}