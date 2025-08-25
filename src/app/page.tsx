import {Navigation} from "@/components/navigation";
import {HeroSection} from "@/components/home/hero-section";
import {ServicesOverview} from "@/components/home/services-overview";
import {HowItWorks} from "@/components/home/how-it-works";
import {WhyChooseUs} from "@/components/home/why-choose-us";
import {Footer} from "@/components/home/footer";
import {getServiceCategoriesAction} from "@/lib/actions/service";
import type {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Expert Laptop & Device Repair Services - Laptop Care',
    description: 'Professional device repair services for laptops, desktops, and printers. Fast turnaround times, quality parts, certified technicians, and 90-day warranty.',
}

export default async function Home() {
    // Fetch categories for the quote form
    const categoriesResult = await getServiceCategoriesAction()
    const categories = categoriesResult.success ? categoriesResult.data || [] : []

    return (
        <div className="font-sans min-h-screen">
            <Navigation/>

            {/* Hero Section with Quote Form */}
            <HeroSection categories={categories}/>

            {/* Services Overview */}
            <ServicesOverview/>

            {/* How It Works Process */}
            <HowItWorks/>

            {/* Why Choose Us Benefits */}
            <WhyChooseUs/>

            {/* Footer */}
            <Footer/>
        </div>
    );
}
