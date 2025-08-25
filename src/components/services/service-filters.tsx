'use client'

import {useState, useEffect} from 'react'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Search, Filter, X} from 'lucide-react'
import {DeviceType} from '@prisma/client'
import type {ServiceFilters, CategoryWithServices} from '@/lib/prisma/service'

interface ServiceFiltersProps {
    categories: CategoryWithServices[]
    filters: ServiceFilters
    onFiltersChange: (filters: ServiceFilters) => void
    isLoading?: boolean
}

const deviceTypeLabels = {
    LAPTOP: 'Laptops',
    DESKTOP: 'Desktops',
    PRINTER: 'Printers'
} as const

const minPrices = [0, 25, 50, 100, 200, 500]
const maxPrices = [50, 100, 200, 500, 1000, 2000]

export function ServiceFilters({categories, filters, onFiltersChange, isLoading}: ServiceFiltersProps) {
    const [localSearch, setLocalSearch] = useState(filters.search || '')
    const [showAllCategories, setShowAllCategories] = useState(false)

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.search) {
                onFiltersChange({...filters, search: localSearch || undefined})
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [localSearch, filters, onFiltersChange])

    const handleDeviceTypeChange = (deviceType: DeviceType) => {
        const newDeviceType = filters.deviceType === deviceType ? undefined : deviceType
        onFiltersChange({...filters, deviceType: newDeviceType})
    }

    const handleCategoryChange = (categoryId: string) => {
        const newCategoryId = filters.categoryId === categoryId ? undefined : categoryId
        onFiltersChange({...filters, categoryId: newCategoryId})
    }

    const handleStatusChange = (isActive: boolean) => {
        const newIsActive = filters.isActive === isActive ? undefined : isActive
        onFiltersChange({...filters, isActive: newIsActive})
    }

    const handlePriceRangeChange = (min?: number, max?: number) => {
        const newPriceRange = min !== undefined || max !== undefined ? {min, max} : undefined
        onFiltersChange({...filters, priceRange: newPriceRange})
    }

    const clearAllFilters = () => {
        setLocalSearch('')
        onFiltersChange({})
    }

    const hasActiveFilters = !!(
        filters.search ||
        filters.deviceType ||
        filters.categoryId ||
        filters.isActive !== undefined ||
        filters.priceRange
    )

    const displayedCategories = showAllCategories ? categories : categories.slice(0, 6)

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5"/>
                    Filter Services
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Search Services</label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Search by name or description..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Device Types */}
                <div>
                    <label className="text-sm font-medium mb-3 block">Device Type</label>
                    <div className="space-y-2">
                        {Object.entries(deviceTypeLabels).map(([type, label]) => {
                            const deviceType = type as DeviceType
                            const isSelected = filters.deviceType === deviceType
                            return (
                                <Button
                                    key={type}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="w-full text-white justify-start"
                                    onClick={() => handleDeviceTypeChange(deviceType)}
                                    disabled={isLoading}>
                                    {label}
                                </Button>
                            )
                        })}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <label className="text-sm font-medium mb-3 block">Service Categories</label>
                    <div className="space-y-2">
                        {displayedCategories.map((category) => {
                            const isSelected = filters.categoryId === category.id
                            return (
                                <Button
                                    key={category.id}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="w-full justify-between text-left"
                                    onClick={() => handleCategoryChange(category.id)}
                                    disabled={isLoading}>
                                    <span className="truncate">{category.name}</span>
                                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                        {category._count.services}
                                    </span>
                                </Button>
                            )
                        })}
                        {categories.length > 6 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                disabled={isLoading}>
                                {showAllCategories ? 'Show Less' : `Show ${categories.length - 6} More`}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Service Status */}
                <div>
                    <label className="text-sm font-medium mb-3 block">Availability</label>
                    <div className="space-y-2">
                        <Button
                            variant={filters.isActive === true ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleStatusChange(true)}
                            disabled={isLoading}>
                            Available Services
                        </Button>
                        <Button
                            variant={filters.isActive === false ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleStatusChange(false)}
                            disabled={isLoading}>
                            Unavailable Services
                        </Button>
                    </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={clearAllFilters}
                        disabled={isLoading}>
                        <X className="h-4 w-4 mr-2"/>
                        Clear All Filters
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}