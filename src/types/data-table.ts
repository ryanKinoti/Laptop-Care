import {ColumnDef, ColumnFiltersState, SortingState, VisibilityState} from '@tanstack/react-table'
import {ReactNode} from 'react'

// Just use ColumnDef directly for simplicity
export type DataTableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>

export interface DataTableFilter {
    id: string
    label: string
    options: { label: string; value: string }[]
    placeholder?: string
    defaultValue?: string
}

export interface DataTableAction<TData> {
    label: string | ((row: TData) => string)
    icon?: ReactNode
    onClick: (row: TData) => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    disabled?: (row: TData) => boolean
    hidden?: (row: TData) => boolean
}

export interface DataTableProps<TData, TValue> {
    // Core data
    data: TData[]
    columns: DataTableColumn<TData, TValue>[]

    // Search functionality
    searchable?: boolean
    searchPlaceholder?: string
    searchColumns?: string[] // Column IDs to search in

    // Filtering
    filters?: DataTableFilter[]

    // Actions
    actions?: DataTableAction<TData>[]

    // Toolbar
    toolbarActions?: ReactNode

    // Pagination
    pagination?: boolean
    pageSize?: number
    pageSizeOptions?: number[]

    // Loading states
    loading?: boolean
    refreshing?: boolean

    // Error handling
    error?: string | null

    // Empty state
    emptyMessage?: string
    emptyIcon?: ReactNode

    // Table styling
    className?: string

    // Selection
    enableRowSelection?: boolean
    onRowSelectionChange?: (selectedRows: TData[]) => void

    // Additional features
    enableColumnResizing?: boolean
    enableColumnVisibility?: boolean
    enableSorting?: boolean

    // Refresh functionality
    onRefresh?: () => void

    // Row click handler
    onRowClick?: (row: TData) => void
}

export interface DataTableState {
    sorting: SortingState
    columnFilters: ColumnFiltersState
    columnVisibility: VisibilityState
    rowSelection: Record<string, boolean>
    globalFilter: string
    pagination: {
        pageIndex: number
        pageSize: number
    }
}