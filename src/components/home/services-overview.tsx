'use client'

import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {
    Laptop,
    Smartphone,
    Printer,
    Wrench,
    Settings,
    Shield,
    ArrowRight
} from 'lucide-react'
import {SERVICES_OVERVIEW} from '@/lib/constants/home'

const iconMap = {
    laptop: Laptop,
    smartphone: Smartphone,
    printer: Printer,
    wrench: Wrench,
    settings: Settings,
    shield: Shield,
} as const

export function ServicesOverview() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {SERVICES_OVERVIEW.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        {SERVICES_OVERVIEW.description}
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SERVICES_OVERVIEW.services.map((service, index) => {
                        const Icon = iconMap[service.icon as keyof typeof iconMap]

                        return (
                            <Card
                                key={index}
                                className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card"
                            >
                                <CardContent className="p-8">
                                    <div className="mb-6">
                                        <div
                                            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                            <Icon className="h-6 w-6 text-primary"/>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">
                                            {service.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>

                                    <Link href={service.link}>
                                        <Button
                                            variant="ghost"
                                            className="group-hover:text-primary p-0 h-auto font-medium"
                                        >
                                            Learn more
                                            <ArrowRight
                                                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}