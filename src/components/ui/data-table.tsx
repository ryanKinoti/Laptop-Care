'use client'

import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {ChevronDown, Search, RefreshCw, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Skeleton} from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {cn} from '@/lib/utils'
import {DataTableProps, DataTableState} from '@/types/data-table'

export function DataTable<TData, TValue>({
                                             data,
                                             columns,
                                             searchable = true,
                                             searchPlaceholder = 'Search...',
                                             searchColumns,
                                             filters = [],
                                             actions = [],
                                             toolbarActions,
                                             pagination = true,
                                             pageSize = 10,
                                             pageSizeOptions = [10, 20, 30, 40, 50],
                                             loading = false,
                                             refreshing = false,
                                             error = null,
                                             emptyMessage = 'No results found.',
                                             emptyIcon,
                                             className,
                                             enableRowSelection = false,
                                             onRowSelectionChange,
                                             enableColumnResizing = false,
                                             enableColumnVisibility = true,
                                             enableSorting = true,
                                             onRefresh,
                                             onRowClick,
                                         }: DataTableProps<TData, TValue>) {
    const [tableState, setTableState] = React.useState<DataTableState>({
        sorting: [],
        columnFilters: [],
        columnVisibility: {},
        rowSelection: {} as Record<string, boolean>,
        globalFilter: '',
        pagination: {
            pageIndex: 0,
            pageSize: pageSize,
        },
    })

    // Initialize filter states from filters prop
    const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>(
        filters.reduce((acc, filter) => {
            acc[filter.id] = filter.defaultValue || 'all'
            return acc
        }, {} as Record<string, string>)
    )

    const table = useReactTable({
        data,
        columns,
        onSortingChange: (updater) => {
            setTableState(prev => ({
                ...prev,
                sorting: typeof updater === 'function' ? updater(prev.sorting) : updater
            }))
        },
        onColumnFiltersChange: (updater) => {
            setTableState(prev => ({
                ...prev,
                columnFilters: typeof updater === 'function' ? updater(prev.columnFilters) : updater
            }))
        },
        onColumnVisibilityChange: (updater) => {
            setTableState(prev => ({
                ...prev,
                columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : updater
            }))
        },
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function' ? updater(tableState.rowSelection) : updater
            setTableState(prev => ({
                ...prev,
                rowSelection: newSelection
            }))

            if (onRowSelectionChange) {
                const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
                onRowSelectionChange(selectedRows)
            }
        },
        onGlobalFilterChange: (updater) => {
            setTableState(prev => ({
                ...prev,
                globalFilter: typeof updater === 'function' ? updater(prev.globalFilter) : updater
            }))
        },
        onPaginationChange: (updater) => {
            setTableState(prev => ({
                ...prev,
                pagination: typeof updater === 'function' ? updater(prev.pagination) : updater
            }))
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting: tableState.sorting,
            columnFilters: tableState.columnFilters,
            columnVisibility: tableState.columnVisibility,
            rowSelection: tableState.rowSelection,
            globalFilter: tableState.globalFilter,
            pagination: tableState.pagination,
        },
        enableRowSelection,
        enableColumnResizing,
        enableSorting,
        globalFilterFn: (row, columnId, value) => {
            if (!searchColumns?.length) {
                // Search all string columns if no specific columns specified
                return Object.values(row.original as object).some(cellValue =>
                    String(cellValue).toLowerCase().includes(value.toLowerCase())
                )
            }

            // Search only specified columns
            return searchColumns.some(colId => {
                const cellValue = row.getValue(colId)
                return String(cellValue).toLowerCase().includes(value.toLowerCase())
            })
        },
    })

    // Apply custom filters (client-side filtering)
    const filteredData = React.useMemo(() => {
        let filtered = [...data]

        // Apply global search filter
        if (tableState.globalFilter) {
            const searchTerm = tableState.globalFilter.toLowerCase()
            filtered = filtered.filter(item => {
                if (!searchColumns?.length) {
                    return Object.values(item as object).some(cellValue =>
                        String(cellValue).toLowerCase().includes(searchTerm)
                    )
                }
                return searchColumns.some(colId => {
                    const cellValue = (item as Record<string, unknown>)[colId]
                    return String(cellValue).toLowerCase().includes(searchTerm)
                })
            })
        }

        // Apply custom filters
        Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
            if (filterValue && filterValue !== 'all') {
                const filter = filters.find(f => f.id === filterId)
                if (filter) {
                    filtered = filtered.filter(item => {
                        const itemValue = (item as Record<string, unknown>)[filterId]
                        return String(itemValue) === filterValue
                    })
                }
            }
        })

        return filtered
    }, [data, tableState.globalFilter, activeFilters, searchColumns, filters])

    // Table uses filteredData which is recalculated when dependencies change

    const clearFilters = () => {
        setTableState(prev => ({
            ...prev,
            globalFilter: '',
            columnFilters: [],
        }))
        setActiveFilters(filters.reduce((acc, filter) => {
            acc[filter.id] = filter.defaultValue || 'all'
            return acc
        }, {} as Record<string, string>))
    }

    const hasActiveFilters = tableState.globalFilter ||
        Object.values(activeFilters).some(value => value && value !== 'all') ||
        tableState.columnFilters.length > 0

    if (loading) {
        return (
            <div className={cn('space-y-4', className)}>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 flex-1 max-w-sm"/>
                    {filters.map((_, i) => (
                        <Skeleton key={i} className="h-10 w-32"/>
                    ))}
                    <Skeleton className="h-10 w-24"/>
                </div>
                <div className="border rounded-lg">
                    <div className="space-y-2 p-4">
                        {Array.from({length: pageSize}).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full"/>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('space-y-4', className)}>
            {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search */}
                    {searchable && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder={searchPlaceholder}
                                value={tableState.globalFilter}
                                onChange={(e) => setTableState(prev => ({
                                    ...prev,
                                    globalFilter: e.target.value
                                }))}
                                className="pl-8"
                            />
                        </div>
                    )}

                    {/* Custom Filters */}
                    {filters.map((filter) => (
                        <Select
                            key={filter.id}
                            value={activeFilters[filter.id]}
                            onValueChange={(value) => {
                                setActiveFilters(prev => ({
                                    ...prev,
                                    [filter.id]: value
                                }))
                            }}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder={filter.placeholder || filter.label}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All {filter.label}</SelectItem>
                                {filter.options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8"
                        >
                            <X className="h-4 w-4 mr-2"/>
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    {onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')}/>
                            Refresh
                        </Button>
                    )}

                    {/* Column Visibility */}
                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Columns <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px]">
                                {table
                                    .getAllColumns()
                                    .filter(column => column.getCanHide())
                                    .map(column => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={value => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Custom Toolbar Actions */}
                    {toolbarActions}
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                                {actions.length > 0 && <TableHead>Actions</TableHead>}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={onRowClick ? 'cursor-pointer' : undefined}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                    {actions.length > 0 && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {actions.map((action, index) => {
                                                    if (action.hidden?.(row.original)) return null

                                                    const label = typeof action.label === 'function'
                                                        ? action.label(row.original)
                                                        : action.label

                                                    return (
                                                        <Button
                                                            key={index}
                                                            variant={action.variant || 'ghost'}
                                                            size={action.size || 'sm'}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                action.onClick(row.original)
                                                            }}
                                                            disabled={action.disabled?.(row.original)}
                                                        >
                                                            {action.icon}
                                                            {label}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                                    className="h-24 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        {emptyIcon}
                                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                                        {hasActiveFilters && (
                                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                filteredData.length
                            )}{' '}
                            of {filteredData.length} results
                            {hasActiveFilters && ' (filtered)'}
                        </p>

                        {pageSizeOptions.length > 1 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rows per page:</span>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value))
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-16">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pageSizeOptions.map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
            </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}