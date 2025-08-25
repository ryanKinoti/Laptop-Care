import {prisma} from '@/lib/prisma/prisma'
import type {User, CustomerProfile, StaffProfile, Prisma} from '@prisma/client'
import {StaffRole, CustomerRole} from '@prisma/client'

export type UserWithProfile = User & {
    customerProfile?: CustomerProfile | null
    staffProfile?: StaffProfile | null
}

export type UserListItem = {
    id: string
    name: string | null
    email: string
    phone: string | null
    preferredContact: string
    accountType: 'staff' | 'customer'
    isActive: boolean
}

export type UserFilters = {
    search?: string
    accountType?: 'staff' | 'customer' | 'all'
    role?: StaffRole | CustomerRole
    isActive?: boolean
}

export class UserService {
    // Get list of users based on requester's role
    static async getUserList(
        requesterId: string,
        filters: UserFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ users: UserListItem[], total: number }> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        // Build where clause based on permissions and filters
        const whereClause: Prisma.UserWhereInput = {}

        // Permission-based filtering
        if (isAdmin) {
            // Admin can see all users
        } else if (isStaff) {
            // Staff can only see customers
            whereClause.isStaff = false
        } else {
            throw new Error('Insufficient permissions')
        }

        // Apply additional filters
        if (filters.search) {
            whereClause.OR = [
                {name: {contains: filters.search, mode: 'insensitive'}},
                {email: {contains: filters.search, mode: 'insensitive'}},
                {phone: {contains: filters.search, mode: 'insensitive'}}
            ]
        }

        if (filters.accountType === 'staff') {
            whereClause.isStaff = true
        } else if (filters.accountType === 'customer') {
            whereClause.isStaff = false
        }

        if (typeof filters.isActive === 'boolean') {
            whereClause.isActive = filters.isActive
        }

        // Add role-specific filtering
        if (filters.role) {
            if (Object.values(StaffRole).includes(filters.role as StaffRole)) {
                whereClause.staffProfile = {
                    role: filters.role as StaffRole
                }
            } else if (Object.values(CustomerRole).includes(filters.role as CustomerRole)) {
                whereClause.customerProfile = {
                    role: filters.role as CustomerRole
                }
            }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    preferredContact: true,
                    isStaff: true,
                    isActive: true
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {createdAt: 'desc'}
            }),
            prisma.user.count({where: whereClause})
        ])

        return {
            users: users.map(user => ({
                ...user,
                preferredContact: user.preferredContact.toString(),
                accountType: user.isStaff ? 'staff' : 'customer'
            })),
            total
        }
    }

    // Get detailed user information with profile
    static async getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
        return await prisma.user.findUnique({
            where: {id: userId},
            include: {
                customerProfile: true,
                staffProfile: true
            }
        })
    }

    // Create a new user
    static async createUser(
        requesterId: string,
        userData: {
            email: string
            name?: string
            phone?: string
            isStaff: boolean
            staffRole?: StaffRole
            customerRole?: CustomerRole
            specializations?: string[]
            availability?: Prisma.JsonValue
            companyName?: string
            address?: string
            notes?: string
        }
    ): Promise<UserWithProfile> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        // Permission checks
        if (userData.isStaff && !isAdmin) {
            throw new Error('Only administrators can create staff users')
        }
        if (!isAdmin && !isStaff) {
            throw new Error('Insufficient permissions to create users')
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: {email: userData.email}
        })
        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        return await prisma.$transaction(async (tx) => {
            // Create base user
            const user = await tx.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    phone: userData.phone,
                    isStaff: userData.isStaff,
                    isSuperuser: userData.isStaff && userData.staffRole === 'ADMINISTRATOR'
                }
            })

            // Create appropriate profile
            if (userData.isStaff && userData.staffRole) {
                await tx.staffProfile.create({
                    data: {
                        userId: user.id,
                        role: userData.staffRole,
                        specializations: userData.specializations || [],
                        availability: userData.availability || {}
                    }
                })
            } else {
                await tx.customerProfile.create({
                    data: {
                        userId: user.id,
                        role: userData.customerRole || 'INDIVIDUAL',
                        companyName: userData.companyName,
                        address: userData.address,
                        notes: userData.notes
                    }
                })
            }

            return await this.getUserWithProfile(user.id) as UserWithProfile
        })
    }

    // Update user information
    static async updateUser(
        requesterId: string,
        userId: string,
        updateData: {
            name?: string
            phone?: string
            isActive?: boolean
            staffRole?: StaffRole
            customerRole?: CustomerRole
            specializations?: string[]
            availability?: Prisma.JsonValue
            companyName?: string
            address?: string
            notes?: string
        }
    ): Promise<UserWithProfile> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const targetUser = await this.getUserWithProfile(userId)
        if (!targetUser) throw new Error('User not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        // Permission checks
        if (targetUser.isStaff && !isAdmin) {
            throw new Error('Only administrators can update staff users')
        }
        if (!isAdmin && !isStaff) {
            throw new Error('Insufficient permissions to update users')
        }

        return await prisma.$transaction(async (tx) => {
            // Update base user
            const userUpdateData: Prisma.UserUpdateInput = {}
            if (updateData.name !== undefined) userUpdateData.name = updateData.name
            if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone
            if (updateData.isActive !== undefined) userUpdateData.isActive = updateData.isActive

            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: {id: userId},
                    data: userUpdateData
                })
            }

            // Update profile-specific data
            if (targetUser.staffProfile) {
                const staffUpdateData: Prisma.StaffProfileUpdateInput = {}
                if (updateData.staffRole) staffUpdateData.role = updateData.staffRole
                if (updateData.specializations) staffUpdateData.specializations = updateData.specializations
                if (updateData.availability) staffUpdateData.availability = updateData.availability

                if (Object.keys(staffUpdateData).length > 0) {
                    await tx.staffProfile.update({
                        where: {userId},
                        data: staffUpdateData
                    })
                }

                // Update isSuperuser if role changes to/from ADMINISTRATOR
                if (updateData.staffRole) {
                    await tx.user.update({
                        where: {id: userId},
                        data: {isSuperuser: updateData.staffRole === 'ADMINISTRATOR'}
                    })
                }
            } else if (targetUser.customerProfile) {
                const customerUpdateData: Prisma.CustomerProfileUpdateInput = {}
                if (updateData.customerRole) customerUpdateData.role = updateData.customerRole
                if (updateData.companyName !== undefined) customerUpdateData.companyName = updateData.companyName
                if (updateData.address !== undefined) customerUpdateData.address = updateData.address
                if (updateData.notes !== undefined) customerUpdateData.notes = updateData.notes

                if (Object.keys(customerUpdateData).length > 0) {
                    await tx.customerProfile.update({
                        where: {userId},
                        data: customerUpdateData
                    })
                }
            }

            return await this.getUserWithProfile(userId) as UserWithProfile
        })
    }

    // Soft delete user (set isActive to false, blocked to true)
    static async softDeleteUser(
        requesterId: string,
        userId: string
    ): Promise<void> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const targetUser = await this.getUserWithProfile(userId)
        if (!targetUser) throw new Error('User not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        // Permission checks
        if (targetUser.isStaff && !isAdmin) {
            throw new Error('Only administrators can delete staff users')
        }
        if (!isAdmin && !isStaff) {
            throw new Error('Insufficient permissions to delete users')
        }

        await prisma.user.update({
            where: {id: userId},
            data: {
                isActive: false,
                blocked: true
            }
        })
    }

    // Hard delete user (permanently remove all related records)
    static async hardDeleteUser(
        requesterId: string,
        userId: string
    ): Promise<void> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const targetUser = await this.getUserWithProfile(userId)
        if (!targetUser) throw new Error('User not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        // Only administrators can hard delete
        if (!isAdmin) {
            throw new Error('Only administrators can permanently delete users')
        }

        // Delete user (cascade will handle related records due to schema constraints)
        await prisma.user.delete({
            where: {id: userId}
        })
    }

    // Restore soft-deleted user
    static async restoreUser(
        requesterId: string,
        userId: string
    ): Promise<UserWithProfile> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        if (!isAdmin && !isStaff) {
            throw new Error('Insufficient permissions to restore users')
        }

        await prisma.user.update({
            where: {id: userId},
            data: {
                isActive: true,
                blocked: false
            }
        })

        return await this.getUserWithProfile(userId) as UserWithProfile
    }

    // Get user statistics
    static async getUserStats(requesterId: string): Promise<{
        totalUsers: number
        activeUsers: number
        staffUsers: number
        customerUsers: number
        blockedUsers: number
    }> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'

        if (!isAdmin) {
            throw new Error('Only administrators can view user statistics')
        }

        const [total, active, staff, customers, blocked] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({where: {isActive: true}}),
            prisma.user.count({where: {isStaff: true}}),
            prisma.user.count({where: {isStaff: false}}),
            prisma.user.count({where: {blocked: true}})
        ])

        return {
            totalUsers: total,
            activeUsers: active,
            staffUsers: staff,
            customerUsers: customers,
            blockedUsers: blocked
        }
    }

    // Toggle user active status
    static async toggleUserStatus(
        requesterId: string,
        userId: string
    ): Promise<UserWithProfile> {
        const requester = await this.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const targetUser = await this.getUserWithProfile(userId)
        if (!targetUser) throw new Error('User not found')

        const isAdmin = requester.isSuperuser &&
            requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        // Permission checks
        if (targetUser.isStaff && !isAdmin) {
            throw new Error('Only administrators can modify staff user status')
        }
        if (!isAdmin && !isStaff) {
            throw new Error('Insufficient permissions to modify user status')
        }

        await prisma.user.update({
            where: {id: userId},
            data: {
                isActive: !targetUser.isActive,
                blocked: targetUser.isActive ? true : false
            }
        })

        return await this.getUserWithProfile(userId) as UserWithProfile
    }
}