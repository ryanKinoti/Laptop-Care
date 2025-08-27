import {ColumnDef} from '@tanstack/react-table'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {ArrowUpDown, MoreHorizontal} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Common column creators
export function createSelectColumn<T>(): ColumnDef<T> {
    return {
        id: 'select',
        header: ({table}) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    }
}

export function createSortableColumn<T>(
    accessor: keyof T,
    header: string,
    options?: {
        cell?: (value: unknown) => React.ReactNode
        className?: string
    }
): ColumnDef<T> {
    return {
        accessorKey: accessor as string,
        header: ({column}) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className={options?.className}
            >
                {header}
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
        cell: ({row}) => {
            const value = row.getValue(accessor as string)
            return options?.cell ? options.cell(value) : <div>{String(value)}</div>
        },
    }
}

export function createTextColumn<T>(
    accessor: keyof T,
    header: string,
    options?: {
        className?: string
        placeholder?: string
    }
): ColumnDef<T> {
    return {
        accessorKey: accessor as string,
        header,
        cell: ({row}) => {
            const value = row.getValue(accessor as string)
            return (
                <div className={options?.className}>
                    {value ? String(value) : (options?.placeholder || 'N/A')}
                </div>
            )
        },
    }
}

export function createBadgeColumn<T>(
    accessor: keyof T,
    header: string,
    badgeConfig: (value: unknown) => {
        label: string
        variant?: 'default' | 'secondary' | 'destructive' | 'outline'
        className?: string
    }
): ColumnDef<T> {
    return {
        accessorKey: accessor as string,
        header,
        cell: ({row}) => {
            const value = row.getValue(accessor as string)
            const config = badgeConfig(value)
            return (
                <Badge variant={config.variant} className={config.className}>
                    {config.label}
                </Badge>
            )
        },
    }
}

export function createDateColumn<T>(
    accessor: keyof T,
    header: string,
    options?: {
        format?: 'short' | 'long' | 'relative'
        className?: string
    }
): ColumnDef<T> {
    return {
        accessorKey: accessor as string,
        header,
        cell: ({row}) => {
            const value = row.getValue(accessor as string)
            if (!value) return <div className={options?.className}>N/A</div>

            const date = new Date(value as string | Date)
            let formattedDate: string

            switch (options?.format || 'short') {
                case 'long':
                    formattedDate = date.toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                    break
                case 'relative':
                    formattedDate = getRelativeTime(date)
                    break
                default:
                    formattedDate = date.toLocaleDateString('en-KE')
            }

            return <div className={options?.className}>{formattedDate}</div>
        },
    }
}

export function createCurrencyColumn<T>(
    accessor: keyof T,
    header: string,
    options?: {
        currency?: string
        locale?: string
        className?: string
    }
): ColumnDef<T> {
    return {
        accessorKey: accessor as string,
        header,
        cell: ({row}) => {
            const value = row.getValue(accessor as string)
            if (value === null || value === undefined) return <div className={options?.className}>N/A</div>

            const amount = Number(value)
            const formatted = new Intl.NumberFormat(options?.locale || 'en-KE', {
                style: 'currency',
                currency: options?.currency || 'KES',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount)

            return <div className={`font-mono font-medium ${options?.className || ''}`}>{formatted}</div>
        },
    }
}

export function createActionsColumn<T>(
    actions: Array<{
        label: string | ((row: T) => string)
        onClick: (row: T) => void
        icon?: React.ReactNode
        destructive?: boolean
        hidden?: (row: T) => boolean
    }>
): ColumnDef<T> {
    return {
        id: 'actions',
        enableHiding: false,
        cell: ({row}) => {
            const data = row.original
            const visibleActions = actions.filter(action => !action.hidden?.(data))

            if (visibleActions.length === 0) return null

            if (visibleActions.length === 1) {
                const action = visibleActions[0]
                const label = typeof action.label === 'function' ? action.label(data) : action.label
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => action.onClick(data)}
                        className={action.destructive ? 'text-destructive' : ''}
                    >
                        {action.icon}
                        {label}
                    </Button>
                )
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4"/>
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        {visibleActions.map((action, index) => {
                            const label = typeof action.label === 'function' ? action.label(data) : action.label
                            return (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() => action.onClick(data)}
                                    className={action.destructive ? 'text-destructive' : ''}
                                >
                                    {action.icon}
                                    {label}
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    }
}

// Utility functions
function getRelativeTime(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) {
        return 'Just now'
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
    } else {
        return date.toLocaleDateString('en-KE')
    }
}

// Common filter configurations
export const commonFilters = {
    status: (activeLabel = 'Active', inactiveLabel = 'Inactive') => ({
        id: 'isActive',
        label: 'Status',
        options: [
            {label: activeLabel, value: 'true'},
            {label: inactiveLabel, value: 'false'},
        ],
        defaultValue: 'all',
    }),

    accountType: () => ({
        id: 'accountType',
        label: 'Type',
        options: [
            {label: 'Staff', value: 'staff'},
            {label: 'Customer', value: 'customer'},
        ],
        defaultValue: 'all',
    }),

    role: (roles: { label: string; value: string }[]) => ({
        id: 'role',
        label: 'Role',
        options: roles,
        defaultValue: 'all',
    }),

    deviceType: () => ({
        id: 'device',
        label: 'Device Type',
        options: [
            {label: 'Laptop', value: 'LAPTOP'},
            {label: 'Phone', value: 'PHONE'},
            {label: 'Tablet', value: 'TABLET'},
            {label: 'Gaming', value: 'GAMING'},
        ],
        defaultValue: 'all',
    }),

    serviceCategory: (categories: { label: string; value: string }[]) => ({
        id: 'categoryId',
        label: 'Category',
        options: categories,
        defaultValue: 'all',
    }),
}

// Common badge configurations
export const commonBadges = {
    status: (value: unknown) => {
        const isActive = Boolean(value)
        return {
            label: isActive ? 'Active' : 'Inactive',
            variant: isActive ? ('outline' as const) : ('destructive' as const),
            className: isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200',
        }
    },

    accountType: (value: unknown) => {
        const type = String(value)
        return {
            label: type === 'staff' ? 'Staff' : 'Customer',
            variant: 'outline' as const,
            className: type === 'staff'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-green-50 text-green-700 border-green-200',
        }
    },

    staffRole: (value: unknown) => {
        const role = String(value)
        const configs = {
            ADMINISTRATOR: {
                label: 'Administrator',
                className: 'bg-red-50 text-red-700 border-red-200'
            },
            TECHNICIAN: {
                label: 'Technician',
                className: 'bg-blue-50 text-blue-700 border-blue-200'
            },
            RECEPTIONIST: {
                label: 'Receptionist',
                className: 'bg-green-50 text-green-700 border-green-200'
            },
        }
        return {
            label: configs[role as keyof typeof configs]?.label || role,
            variant: 'outline' as const,
            className: configs[role as keyof typeof configs]?.className || '',
        }
    },

    customerRole: (value: unknown) => {
        const role = String(value)
        return {
            label: role === 'COMPANY' ? 'Business Customer' : 'Individual Customer',
            variant: 'outline' as const,
            className: 'bg-purple-50 text-purple-700 border-purple-200',
        }
    },

    deviceType: (value: unknown) => {
        const device = String(value)
        const configs = {
            LAPTOP: {
                label: 'Laptop',
                className: 'bg-blue-50 text-blue-700 border-blue-200'
            },
            PHONE: {
                label: 'Phone',
                className: 'bg-green-50 text-green-700 border-green-200'
            },
            TABLET: {
                label: 'Tablet',
                className: 'bg-purple-50 text-purple-700 border-purple-200'
            },
            GAMING: {
                label: 'Gaming',
                className: 'bg-red-50 text-red-700 border-red-200'
            },
        }
        return {
            label: configs[device as keyof typeof configs]?.label || device.charAt(0).toUpperCase() + device.slice(1).toLowerCase(),
            variant: 'secondary' as const,
            className: configs[device as keyof typeof configs]?.className || '',
        }
    },

    serviceCategory: (value: unknown) => {
        const category = String(value)
        return {
            label: category,
            variant: 'outline' as const,
            className: 'bg-slate-50 text-slate-700 border-slate-200',
        }
    },
}