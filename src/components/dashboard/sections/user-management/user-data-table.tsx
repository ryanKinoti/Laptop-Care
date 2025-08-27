'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {DataTable} from '@/components/ui/data-table'
import {getUserListAction, toggleUserStatusAction} from '@/lib/actions/user'
import {UserListItem, UserFilters} from '@/lib/prisma/user'
import {useAuthStore} from '@/stores/auth-store'
import {useDashboardStore} from '@/stores/dashboard-store'
import {Plus, Eye, Users} from 'lucide-react'
import {CreateUserModal} from './create-user-modal'
import {DataTableFilter, DataTableAction} from '@/types/data-table'
import {createTextColumn, createBadgeColumn, commonFilters, commonBadges} from '@/lib/data-table-utils'
import {ColumnDef} from '@tanstack/react-table'

interface UserDataTableProps {
    onUserSelect: (userId: string) => void
}

export function UserDataTable({onUserSelect}: UserDataTableProps) {
    const [users, setUsers] = useState<UserListItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [limit] = useState(50)
    const [createModalOpen, setCreateModalOpen] = useState(false)

    // Use centralized state management
    const loading = useDashboardStore(state => state.userDataTableLoading)
    const refreshing = useDashboardStore(state => state.userDataTableRefreshing)
    const setLoading = useDashboardStore(state => state.setUserDataTableLoading)
    const setRefreshing = useDashboardStore(state => state.setUserDataTableRefreshing)
    const userDataRefreshKey = useDashboardStore(state => state.userDataRefreshKey)
    const refreshUserStats = useDashboardStore(state => state.refreshUserStats)

    // Get auth state but don't duplicate permission logic
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)
    const canAccess = useAuthStore(state => state.canAccess)

    // Use existing auth store permissions instead of duplicating logic
    const canCreateUsers = canAccess('userManagement') && (
        user?.staffRole === 'RECEPTIONIST' ||
        user?.staffRole === 'ADMINISTRATOR' ||
        currentRole === 'admin' ||
        currentRole === 'superuser'
    )
    const canViewAllUsers = canAccess('userManagement') && (
        user?.staffRole === 'ADMINISTRATOR' ||
        currentRole === 'admin' ||
        currentRole === 'superuser'
    )

    const fetchUsers = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            setError(null)

            const baseFilters: UserFilters = {}
            const result = await getUserListAction(baseFilters, 1, limit)

            if (result.success && result.data) {
                setUsers(result.data.users)
                setTotal(result.data.total)
            } else {
                setError(result.error || 'Failed to load users')
            }
        } catch (err) {
            setError('Failed to load users')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [userDataRefreshKey])

    const handleRefresh = () => {
        fetchUsers(true)
    }

    const handleToggleStatus = async (userId: string) => {
        try {
            const result = await toggleUserStatusAction(userId)
            if (result.success) {
                fetchUsers(true)
                refreshUserStats()
            } else {
                setError(result.error || 'Failed to toggle user status')
            }
        } catch (err) {
            setError('Failed to toggle user status')
        }
    }

    // Define columns for the data table
    const columns: ColumnDef<UserListItem>[] = [
        createTextColumn('name', 'Name', {
            placeholder: 'No name',
            className: 'font-medium'
        }),
        createTextColumn('email', 'Email'),
        createTextColumn('phone', 'Phone', {placeholder: 'No phone'}),
        createBadgeColumn('accountType', 'Type', commonBadges.accountType),
        createBadgeColumn('isActive', 'Status', commonBadges.status),
    ]

    // Define filters
    const filters: DataTableFilter[] = []

    if (canViewAllUsers) {
        filters.push(commonFilters.accountType())
    }

    filters.push(commonFilters.status())

    // Define actions
    const actions: DataTableAction<UserListItem>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4 mr-2"/>,
            onClick: (user) => onUserSelect(user.id),
            variant: 'ghost',
            size: 'sm',
        },
    ]

    if (canViewAllUsers) {
        actions.push({
            label: (user: UserListItem) => user.isActive ? 'Deactivate' : 'Activate',
            onClick: (user) => handleToggleStatus(user.id),
            variant: 'ghost',
            size: 'sm',
        })
    }

    // Define toolbar actions
    const toolbarActions = (
        <>
            {canCreateUsers && (
                <CreateUserModal
                    open={createModalOpen}
                    onOpenChange={setCreateModalOpen}
                    onSuccess={() => fetchUsers(true)}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2"/>
                        Add User
                    </Button>
                </CreateUserModal>
            )}
        </>
    )

    return (
        <DataTable
            data={users}
            columns={columns}
            loading={loading}
            refreshing={refreshing}
            error={error}
            searchable={true}
            searchPlaceholder="Search users..."
            searchColumns={['name', 'email', 'phone']}
            filters={filters}
            actions={actions}
            toolbarActions={toolbarActions}
            onRefresh={handleRefresh}
            emptyMessage="No users found"
            emptyIcon={<Users className="h-8 w-8 text-muted-foreground"/>}
            pagination={true}
            pageSize={20}
            pageSizeOptions={[10, 20, 30, 50]}
        />
    )
}