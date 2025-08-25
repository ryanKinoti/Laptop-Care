import {Navigation} from '@/components/navigation'
import {ServicesPageContent} from '@/components/services/services-page-content'
import type {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Our Services - Laptop Care Services',
    description: 'Professional device repair services for laptops, desktops, and printers. Choose from our comprehensive range of technical services.',
}

export default function ServicesPage() {
    return (
        <div className="font-sans min-h-screen">
            <Navigation/>
            <ServicesPageContent/>
        </div>
    )
}