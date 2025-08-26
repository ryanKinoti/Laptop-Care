'use server'

import {getAuthenticatedUser} from '@/lib/auth'
import {UserService, type UserWithProfile, type UserListItem, type UserFilters} from '@/lib/prisma/user'
import {revalidatePath} from 'next/cache'
import {StaffRole, CustomerRole, type Prisma} from '@prisma/client'
import {ActionResult} from "@/types/common";

export async function getUserListAction(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 20
): Promise<ActionResult<{ users: UserListItem[], total: number }>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const result = await UserService.getUserList(requesterId, filters, page, limit)

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Get user list error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch users'
        }
    }
}

export async function getUserWithProfileAction(
    userId: string
): Promise<ActionResult<UserWithProfile>> {
    try {
        const requesterId = await getAuthenticatedUser()

        // Check if user has permission to view this profile
        const requester = await UserService.getUserWithProfile(requesterId)
        if (!requester) throw new Error('Requester not found')

        const isAdmin = requester.isSuperuser && requester.staffProfile?.role === 'ADMINISTRATOR'
        const isStaff = requester.isStaff && !requester.isSuperuser

        // Users can view their own profile, staff can view customer profiles, admin can view all
        if (userId !== requesterId) {
            const targetUser = await UserService.getUserWithProfile(userId)
            if (!targetUser) throw new Error('User not found')

            if (targetUser.isStaff && !isAdmin) {
                throw new Error('Only administrators can view staff profiles')
            }
            if (!isAdmin && !isStaff) {
                throw new Error('Insufficient permissions to view user profile')
            }
        }

        const user = await UserService.getUserWithProfile(userId)
        if (!user) {
            return {
                success: false,
                error: 'User not found'
            }
        }

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Get user profile error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user profile'
        }
    }
}

export async function createUserAction(userData: {
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
}): Promise<ActionResult<UserWithProfile>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const user = await UserService.createUser(requesterId, userData)

        revalidatePath('/dashboard/users')

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Create user error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create user'
        }
    }
}

export async function updateUserAction(
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
): Promise<ActionResult<UserWithProfile>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const user = await UserService.updateUser(requesterId, userId, updateData)

        revalidatePath('/dashboard/users')
        revalidatePath(`/dashboard/users/${userId}`)

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Update user error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update user'
        }
    }
}

export async function softDeleteUserAction(
    userId: string
): Promise<ActionResult> {
    try {
        const requesterId = await getAuthenticatedUser()
        await UserService.softDeleteUser(requesterId, userId)

        revalidatePath('/dashboard/users')

        return {
            success: true
        }
    } catch (error) {
        console.error('Soft delete user error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to deactivate user'
        }
    }
}

export async function hardDeleteUserAction(
    userId: string
): Promise<ActionResult> {
    try {
        const requesterId = await getAuthenticatedUser()
        await UserService.hardDeleteUser(requesterId, userId)

        revalidatePath('/dashboard/users')

        return {
            success: true
        }
    } catch (error) {
        console.error('Hard delete user error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to permanently delete user'
        }
    }
}

export async function restoreUserAction(
    userId: string
): Promise<ActionResult<UserWithProfile>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const user = await UserService.restoreUser(requesterId, userId)

        revalidatePath('/dashboard/users')

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Restore user error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to restore user'
        }
    }
}

export async function getUserStatsAction(): Promise<ActionResult<{
    totalUsers: number
    activeUsers: number
    staffUsers: number
    customerUsers: number
    blockedUsers: number
}>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const stats = await UserService.getUserStats(requesterId)

        return {
            success: true,
            data: stats
        }
    } catch (error) {
        console.error('Get user stats error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user statistics'
        }
    }
}

export async function toggleUserStatusAction(
    userId: string
): Promise<ActionResult<UserWithProfile>> {
    try {
        const requesterId = await getAuthenticatedUser()
        const user = await UserService.toggleUserStatus(requesterId, userId)

        revalidatePath('/dashboard/users')
        revalidatePath(`/dashboard/users/${userId}`)

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Toggle user status error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to toggle user status'
        }
    }
}

export async function getCurrentUserAction(): Promise<ActionResult<UserWithProfile>> {
    try {
        const userId = await getAuthenticatedUser()
        const user = await UserService.getUserWithProfile(userId)

        if (!user) {
            return {
                success: false,
                error: 'Current user not found'
            }
        }

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Get current user error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch current user'
        }
    }
}

export async function updateCurrentUserProfileAction(
    updateData: {
        name?: string
        phone?: string
        companyName?: string
        address?: string
        notes?: string
    }
): Promise<ActionResult<UserWithProfile>> {
    try {
        const userId = await getAuthenticatedUser()
        const user = await UserService.updateUser(userId, userId, updateData)

        revalidatePath('/dashboard/profile')

        return {
            success: true,
            data: user
        }
    } catch (error) {
        console.error('Update current user profile error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update profile'
        }
    }
}