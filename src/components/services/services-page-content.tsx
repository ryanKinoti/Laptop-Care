'use client'

import {useEffect} from 'react'
import {ServiceFilters} from '@/components/services/service-filters'
import {ServiceCard} from '@/components/services/service-card'
import {ServiceDetailsModal} from '@/components/services/service-details-modal'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import {AlertTriangle, RefreshCw, Grid, List} from 'lucide-react'
import {useServicesStore} from '@/stores/services-store'

export function ServicesPageContent() {
    // Zustand store state
    const {
        services,
        categories,
        total,
        currentPage,
        loading,
        error,
        filters,
        viewMode,
        selectedServiceId,
        isModalOpen,
        servicesPerPage,
        // Actions
        loadServices,
        loadCategories,
        setFilters,
        resetFilters,
        setViewMode,
        setCurrentPage,
        openModal,
        closeModal,
        retry,
    } = useServicesStore()

    // Computed values (directly from store to avoid extra subscriptions)
    const totalPages = Math.ceil(total / servicesPerPage)
    const hasServices = services.length > 0

    // Load data on mount
    useEffect(() => {
        loadCategories()
        loadServices(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array - only run once on mount. Zustand actions are stable.

    // Event handlers
    const handleRequestService = (serviceId: string) => {
        console.log('Request service:', serviceId)
        alert(`Service request for ${serviceId} - This would typically open a booking form or redirect to a request page.`)
    }

    if (loading && !hasServices) {
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
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:w-80 flex-shrink-0">
                    <ServiceFilters
                        categories={categories}
                        filters={filters}
                        onFiltersChange={setFilters}
                        isLoading={loading}
                    />
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold">
                                {total > 0 ? (
                                    <>
                                        {total} Service{total !== 1 ? 's' : ''} Found
                                    </>
                                ) : (
                                    'No Services Found'
                                )}
                            </h2>
                            {loading && (
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
                    {error && (
                        <Alert className="mb-6">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDescription className="flex items-center justify-between">
                                <span>{error}</span>
                                <Button variant="outline" size="sm" onClick={retry}>
                                    Try Again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Services Grid/List */}
                    {services.length > 0 ? (
                        <>
                            <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                                    : "space-y-4"
                            }>
                                {services.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        onRequestService={handleRequestService}
                                        onMoreDetails={openModal}
                                        showUnavailable={filters.isActive === false}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > 0 && (
                                <div className="mt-8">
                                    <CustomPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={total}
                                        itemsPerPage={servicesPerPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        !loading && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground mb-4">
                                    <Grid className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                    <h3 className="text-lg font-medium mb-2">No services found</h3>
                                    <p>Try adjusting your filters to see more results.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )
                    )}
                </main>
            </div>

            {/* Service Details Modal */}
            <ServiceDetailsModal
                serviceId={selectedServiceId}
                isOpen={isModalOpen}
                onClose={closeModal}
                onRequestService={handleRequestService}
            />
        </div>
    )
}

// Custom pagination component using shadcn components
function CustomPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}) {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Generate page numbers to display
    const getVisiblePages = () => {
        const pages: (number | 'ellipsis')[] = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)

            // Adjust range if near beginning or end
            if (currentPage <= 3) {
                endPage = Math.min(4, totalPages - 1)
            }
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 3)
            }

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('ellipsis')
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('ellipsis')
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (totalPages <= 1) {
        return (
            <div className="flex items-center justify-center text-sm text-muted-foreground py-4">
                Showing {startItem} - {endItem} of {totalItems} services
            </div>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items info */}
            <div className="text-sm text-muted-foreground">
                Showing {startItem} - {endItem} of {totalItems} services
            </div>

            {/* Pagination */}
            <Pagination>
                <PaginationContent>
                    {/* Previous button */}
                    <PaginationItem>
                        <PaginationPrevious 
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) {
                                    onPageChange(currentPage - 1)
                                }
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {/* Page numbers */}
                    {getVisiblePages().map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onPageChange(page as number)
                                    }}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Next button */}
                    <PaginationItem>
                        <PaginationNext 
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage < totalPages) {
                                    onPageChange(currentPage + 1)
                                }
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
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