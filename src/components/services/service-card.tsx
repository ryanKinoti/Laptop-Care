'use client'

import {Card, CardContent, CardHeader, CardTitle, CardFooter} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Clock, Monitor, Laptop, Printer, Wrench, Eye} from 'lucide-react'
import type {ServiceListItem} from '@/lib/prisma/service'

interface ServiceCardProps {
    service: ServiceListItem
    onRequestService?: (serviceId: string) => void
    onMoreDetails?: (serviceId: string) => void
    showUnavailable?: boolean
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

export function ServiceCard({service, onRequestService, onMoreDetails, showUnavailable = false}: ServiceCardProps) {
    const DeviceIcon = deviceTypeIcons[service.device]
    const deviceLabel = deviceTypeLabels[service.device]

    const isUnavailable = !service.isActive

    if (isUnavailable && !showUnavailable) {
        return null
    }

    const handleRequestService = () => {
        if (onRequestService && service.isActive) {
            onRequestService(service.id)
        }
    }

    const handleMoreDetails = () => {
        if (onMoreDetails) {
            onMoreDetails(service.id)
        }
    }

    return (
        <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
            isUnavailable ? 'opacity-60' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                        isUnavailable
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/10 text-primary'
                    }`}>
                        <DeviceIcon className="h-5 w-5"/>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">
                            {service.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {deviceLabel}
                        </p>
                        {isUnavailable && (
                            <Badge variant="secondary" className="text-xs mt-2">
                                Unavailable
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-4">
                <div className="space-y-3">
                    {/* Service Category */}
                    <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm text-muted-foreground">
                            Category: <span className="text-foreground font-medium">
                                {service.categoryName}
                            </span>
                        </span>
                    </div>

                    {/* Estimated Time */}
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm text-muted-foreground">
                            Estimated time: <span className="text-foreground font-medium">
                                {service.estimatedTime}
                            </span>
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2">
                <div className="w-full space-y-3">
                    <Button
                        className="w-full text-white"
                        onClick={handleRequestService}
                        disabled={isUnavailable}
                        variant={isUnavailable ? "secondary" : "default"}>
                        {isUnavailable ? 'Currently Unavailable' : 'Request This Service'}
                    </Button>

                    <Button
                        className="w-full"
                        onClick={handleMoreDetails}
                        variant="outline"
                        size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        More Details
                    </Button>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Service ID: {service.id.slice(-8)}</span>
                        <span className={`font-medium ${
                            isUnavailable ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'
                        }`}>
                            {isUnavailable ? 'Not Available' : 'Available Now'}
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}