'use client'

import React, {useState, useEffect} from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Skeleton} from '@/components/ui/skeleton'
import {
    Clock,
    Monitor,
    Laptop,
    Printer,
    Wrench,
    DollarSign,
    FileText,
    Info,
    X
} from 'lucide-react'
import {getServiceWithCategoryAction} from '@/lib/actions/service'
import type {ServiceWithCategory} from '@/lib/prisma/service'

interface ServiceDetailsModalProps {
    serviceId: string | null
    isOpen: boolean
    onClose: () => void
    onRequestService?: (serviceId: string) => void
}

const deviceTypeIcons = {
    LAPTOP: Laptop,
    DESKTOP: Monitor,
    PRINTER: Printer,
} as const

const deviceTypeLabels = {
    LAPTOP: 'Laptop Service',
    DESKTOP: 'Desktop Service',
    PRINTER: 'Printer Service',
} as const

export function ServiceDetailsModal({
                                        serviceId,
                                        isOpen,
                                        onClose,
                                        onRequestService
                                    }: ServiceDetailsModalProps) {
    const [service, setService] = useState<ServiceWithCategory | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && serviceId) {
            loadServiceDetails()
        }
    }, [isOpen, serviceId])

    const loadServiceDetails = async () => {
        if (!serviceId) return

        setLoading(true)
        setError(null)

        try {
            const result = await getServiceWithCategoryAction(serviceId)

            if (result.success && result.data) {
                setService(result.data)
            } else {
                setError(result.error || 'Failed to load service details')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error('Service details error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRequestService = () => {
        if (service && onRequestService && service.isActive) {
            onRequestService(service.id)
            onClose()
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES'
        }).format(price)
    }

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">Service Details</DialogTitle>
                    </div>
                    <DialogDescription>
                        Complete information about this service
                    </DialogDescription>
                </DialogHeader>

                {loading && <ServiceDetailsSkeleton/>}

                {error && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="text-destructive">
                            <X className="h-8 w-8"/>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">Error Loading Service</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                        <Button onClick={loadServiceDetails} variant="outline">
                            Try Again
                        </Button>
                    </div>
                )}

                {service && !loading && !error && (
                    <div className="space-y-6">
                        {/* Service Header */}
                        <div className="border-b pb-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${
                                    !service.isActive
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-primary/10 text-primary'
                                }`}>
                                    {React.createElement(deviceTypeIcons[service.device], {
                                        className: "h-6 w-6"
                                    })}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-2xl font-bold">{service.name}</h2>
                                        {!service.isActive && (
                                            <Badge variant="secondary">
                                                Unavailable
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground">
                                        {deviceTypeLabels[service.device]}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                        {formatPrice(service.price)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Starting from</p>
                                </div>
                            </div>
                        </div>

                        {/* Service Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Wrench className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">Category</p>
                                    <p className="text-sm text-muted-foreground">
                                        {service.category.name}
                                    </p>
                                </div>
                            </div>

                            {/* Estimated Time */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Clock className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">Estimated Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {service.estimatedTime}
                                    </p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <DollarSign className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">Base Price</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatPrice(service.price)}
                                    </p>
                                </div>
                            </div>

                            {/* Service ID */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Info className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">Service ID</p>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {service.id.slice(-8)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {service.description && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground"/>
                                    <h3 className="font-semibold">Description</h3>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <p className="text-sm leading-relaxed">{service.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Additional Notes */}
                        {service.notes && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground"/>
                                    <h3 className="font-semibold">Additional Information</h3>
                                </div>
                                <div
                                    className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                    <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                                        {service.notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Category Description */}
                        {service.category.description && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-muted-foreground"/>
                                    <h3 className="font-semibold">About {service.category.name}</h3>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <p className="text-sm leading-relaxed">{service.category.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                onClick={handleRequestService}
                                disabled={!service.isActive}
                                className="flex-1"
                                variant={!service.isActive ? "secondary" : "default"}
                            >
                                {!service.isActive ? 'Currently Unavailable' : 'Request This Service'}
                            </Button>
                            <Button onClick={onClose} variant="outline">
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// Skeleton component for loading state
function ServiceDetailsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="border-b pb-4">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg"/>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-64"/>
                        <Skeleton className="h-4 w-32"/>
                    </div>
                    <div className="text-right space-y-1">
                        <Skeleton className="h-8 w-20"/>
                        <Skeleton className="h-3 w-16"/>
                    </div>
                </div>
            </div>

            {/* Information Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Skeleton className="h-5 w-5"/>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-16"/>
                            <Skeleton className="h-3 w-24"/>
                        </div>
                    </div>
                ))}
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4"/>
                    <Skeleton className="h-5 w-20"/>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-3/4"/>
                </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3 pt-4 border-t">
                <Skeleton className="h-10 flex-1"/>
                <Skeleton className="h-10 w-20"/>
            </div>
        </div>
    )
}