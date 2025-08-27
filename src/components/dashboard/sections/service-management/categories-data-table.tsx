'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {DataTable} from '@/components/ui/data-table'
import {useDashboardStore} from '@/stores/dashboard-store'
import {getServiceCategoriesForAdminAction} from '@/lib/actions/service'
import {ServiceCategoryWithServicesClientDTO} from '@/types/service'
import {ColumnDef} from '@tanstack/react-table'
import {Eye, Edit, Plus, Tag} from 'lucide-react'
import {DataTableFilter, DataTableAction} from '@/types/data-table'
import {
    createBadgeColumn,
    commonFilters, 
    commonBadges
} from '@/lib/data-table-utils'

interface CategoriesDataTableProps {
    onCategorySelect: (categoryId: string) => void
    onCreateCategory?: () => void
    onEditCategory?: (categoryId: string) => void
}

export function CategoriesDataTable({
    onCategorySelect,
    onCreateCategory,
    onEditCategory
}: CategoriesDataTableProps) {
    const [categories, setCategories] = useState<ServiceCategoryWithServicesClientDTO[]>([])
    const [error, setError] = useState<string | null>(null)

    const categoriesLoading = useDashboardStore(state => state.categoriesLoading)
    const categoriesRefreshing = useDashboardStore(state => state.categoriesRefreshing)
    const setCategoriesLoading = useDashboardStore(state => state.setCategoriesLoading)
    const setCategoriesRefreshing = useDashboardStore(state => state.setCategoriesRefreshing)
    const categoryDataRefreshKey = useDashboardStore(state => state.categoryDataRefreshKey)

    const fetchCategories = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setCategoriesRefreshing(true)
            } else {
                setCategoriesLoading(true)
            }
            setError(null)

            const result = await getServiceCategoriesForAdminAction(true)
            
            if (result.success && result.data) {
                setCategories(result.data)
            } else {
                setError(result.error || 'Failed to fetch service categories')
                setCategories([])
            }
        } catch (err) {
            setError('An unexpected error occurred')
            setCategories([])
            console.error('Categories fetch error:', err)
        } finally {
            setCategoriesLoading(false)
            setCategoriesRefreshing(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [categoryDataRefreshKey])

    const handleRefresh = () => {
        fetchCategories(true)
    }

    // Define columns using the centralized system
    const columns: ColumnDef<ServiceCategoryWithServicesClientDTO>[] = [
        {
            accessorKey: 'name',
            header: 'Category Name',
            cell: ({row}) => {
                const category = row.original
                return (
                    <div className="space-y-1">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                                {category.description}
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: '_count.services',
            header: 'Total Services',
            cell: ({row}) => {
                const count = row.original._count.services
                return (
                    <Badge variant="outline" className="font-mono">
                        {count}
                    </Badge>
                )
            }
        },
        {
            id: 'activeServices',
            header: 'Active Services',
            cell: ({row}) => {
                const category = row.original
                const activeCount = category.services.filter(s => s.isActive).length
                return (
                    <Badge variant="default" className="font-mono">
                        {activeCount}
                    </Badge>
                )
            }
        },
        createBadgeColumn('isActive', 'Status', commonBadges.status),
    ]

    // Define filters
    const filters: DataTableFilter[] = [
        commonFilters.status()
    ]

    // Define actions
    const actions: DataTableAction<ServiceCategoryWithServicesClientDTO>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (category) => onCategorySelect(category.id),
            variant: 'ghost',
            size: 'sm',
        },
    ]

    if (onEditCategory) {
        actions.push({
            label: 'Edit',
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (category) => onEditCategory(category.id),
            variant: 'ghost',
            size: 'sm',
        })
    }

    // Define toolbar actions
    const toolbarActions = (
        <>
            {onCreateCategory && (
                <Button onClick={onCreateCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                </Button>
            )}
        </>
    )

    return (
        <DataTable
            data={categories}
            columns={columns}
            loading={categoriesLoading}
            refreshing={categoriesRefreshing}
            error={error}
            searchable={true}
            searchPlaceholder="Search categories..."
            searchColumns={['name']}
            filters={filters}
            actions={actions}
            toolbarActions={toolbarActions}
            onRefresh={handleRefresh}
            emptyMessage="No categories found"
            emptyIcon={<Tag className="h-8 w-8 text-muted-foreground" />}
            pagination={true}
            pageSize={20}
            pageSizeOptions={[10, 20, 30, 50]}
        />
    )
}