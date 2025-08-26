'use client'

import { Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardPageContent() {
    return (
        <DashboardLayout>
            <DashboardContent />
        </DashboardLayout>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <DashboardPageContent />
        </Suspense>
    )
}