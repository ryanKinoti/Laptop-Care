'use client'

import { Suspense } from 'react'
import { CustomerLayout } from '@/components/customer/customer-layout'
import { CustomerDashboard } from '@/components/customer/customer-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

function CustomerPageContent() {
    return (
        <CustomerLayout>
            <CustomerDashboard />
        </CustomerLayout>
    )
}

export default function CustomerPage() {
    return (
        <Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <CustomerPageContent />
        </Suspense>
    )
}