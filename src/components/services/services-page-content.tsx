'use client'

import {useState, useEffect, useCallback, useMemo} from 'react'
import {ServiceFilters} from '@/components/services/service-filters'
import {ServiceCard} from '@/components/services/service-card'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {getServiceListAction, getServiceCategoriesAction} from '@/lib/actions/service'
import {AlertTriangle, RefreshCw, Grid, List} from 'lucide-react'
import type {ServiceListItem, ServiceFilters as ServiceFiltersType, CategoryWithServices} from '@/lib/prisma/service'

interface ServicesPageState {
    services: ServiceListItem[]
    categories: CategoryWithServices[]
    filters: ServiceFiltersType
    loading: boolean
    error: string | null
    total: number
    page: number
    hasMore: boolean
}

const SERVICES_PER_PAGE = 12

export function ServicesPageContent() {
    const [state, setState] = useState<ServicesPageState>({
        services: [],
        categories: [],
        filters: {isActive: true}, // Default to showing only active services
        loading: true,
        error: null,
        total: 0,
        page: 1,
        hasMore: false
    })

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [loadingMore, setLoadingMore] = useState(false)

    // Load categories on mount
    useEffect(() => {
        async function loadCategories() {
            try {
                const result = await getServiceCategoriesAction()
                if (result.success && result.data) {
                    setState(prev => ({...prev, categories: result.data!}))
                }
            } catch (error) {
                console.error('Failed to load categories:', error)
            }
        }

        loadCategories()
    }, [])

    // Memoize the current filters to prevent unnecessary re-renders
    const filtersRef = useMemo(() => state.filters, [
        state.filters.search,
        state.filters.categoryId, 
        state.filters.deviceType,
        state.filters.isActive,
        state.filters.priceRange?.min,
        state.filters.priceRange?.max
    ])

    const loadServices = useCallback(async (reset = false) => {
        const targetPage = reset ? 1 : state.page
        const isInitialLoad = reset

        if (!isInitialLoad) setLoadingMore(true)

        try {
            setState(prev => ({
                ...prev,
                loading: isInitialLoad,
                error: null
            }))

            const result = await getServiceListAction(
                state.filters,
                targetPage,
                SERVICES_PER_PAGE
            )

            if (result.success && result.data) {
                const {services, total} = result.data
                const hasMore = targetPage * SERVICES_PER_PAGE < total

                setState(prev => ({
                    ...prev,
                    services: reset ? services : [...prev.services, ...services],
                    total,
                    page: targetPage,
                    hasMore,
                    loading: false,
                    error: null
                }))
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error || 'Failed to load services'
                }))
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'An unexpected error occurred'
            }))
        } finally {
            setLoadingMore(false)
        }
    }, [state.page, state.filters])

    // Load services when filters change
    useEffect(() => {
        void loadServices(true)
    }, [filtersRef])

    const handleFiltersChange = (newFilters: ServiceFiltersType) => {
        setState(prev => ({
            ...prev,
            filters: newFilters,
            page: 1
        }))
    }

    const handleLoadMore = () => {
        setState(prev => ({
            ...prev,
            page: prev.page + 1
        }))
        loadServices(false)
    }

    const handleRequestService = (serviceId: string) => {
        // This would typically navigate to a service request page or open a modal
        console.log('Request service:', serviceId)
        // For now, we'll just show an alert
        alert(`Service request for ${serviceId} - This would typically open a booking form or redirect to a request page.`)
    }

    const handleRetry = () => {
        loadServices(true)
    }

    if (state.loading && state.services.length === 0) {
        return <ServicesPageSkeleton/>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Our Professional Services</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Choose from our comprehensive range of technical services designed to keep your devices running
                    smoothly.
                    Our expert technicians are ready to help with laptops, desktops, and printers.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:w-80 flex-shrink-0">
                    <ServiceFilters
                        categories={state.categories}
                        filters={state.filters}
                        onFiltersChange={handleFiltersChange}
                        isLoading={state.loading}
                    />
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold">
                                {state.total > 0 ? (
                                    <>
                                        {state.total} Service{state.total !== 1 ? 's' : ''} Found
                                    </>
                                ) : (
                                    'No Services Found'
                                )}
                            </h2>
                            {state.loading && (
                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground"/>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="h-4 w-4"/>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* Error State */}
                    {state.error && (
                        <Alert className="mb-6">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDescription className="flex items-center justify-between">
                                <span>{state.error}</span>
                                <Button variant="outline" size="sm" onClick={handleRetry}>
                                    Try Again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Services Grid/List */}
                    {state.services.length > 0 ? (
                        <>
                            <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                                    : "space-y-4"
                            }>
                                {state.services.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        onRequestService={handleRequestService}
                                        showUnavailable={state.filters.isActive === false}
                                    />
                                ))}
                            </div>

                            {/* Load More */}
                            {state.hasMore && (
                                <div className="text-center mt-8">
                                    <Button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        variant="outline"
                                        size="lg"
                                    >
                                        {loadingMore ? (
                                            <RefreshCw className="h-4 w-4 animate-spin mr-2"/>
                                        ) : null}
                                        {loadingMore ? 'Loading...' : 'Load More Services'}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        !state.loading && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground mb-4">
                                    <Grid className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                    <h3 className="text-lg font-medium mb-2">No services found</h3>
                                    <p>Try adjusting your filters to see more results.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => handleFiltersChange({isActive: true})}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    )
}

function ServicesPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="mb-8 text-center">
                <Skeleton className="h-10 w-96 mx-auto mb-4"/>
                <Skeleton className="h-6 w-full max-w-3xl mx-auto"/>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar Skeleton */}
                <aside className="lg:w-80 flex-shrink-0">
                    <Skeleton className="h-96 w-full"/>
                </aside>

                {/* Main Content Skeleton */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-7 w-48"/>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-9"/>
                            <Skeleton className="h-9 w-9"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({length: 6}).map((_, i) => (
                            <Skeleton key={i} className="h-80 w-full"/>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}