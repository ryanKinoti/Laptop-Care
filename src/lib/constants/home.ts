import {DeviceType} from '@prisma/client'
import {
    Search,
    Truck,
    Wrench,
    CheckCircle,
    Clock,
    Shield,
    CreditCard,
    Users,
    Settings,
    Eye
} from 'lucide-react'

// Hero Section
export const HERO_CONTENT = {
    badge: "Fast & Reliable Service",
    title: "Expert Laptop & Device Repair Services",
    highlight: "Repair", // Word to highlight in blue
    description: "We fix all types of laptops, desktops, and other devices with fast turnaround times and quality parts. Most repairs completed same day!",
    cta: {
        primary: "Book a Repair",
        secondary: "View Services"
    },
    features: [
        "90-Day Warranty",
        "Free Diagnostics",
        "Certified Technicians"
    ]
}

export const QUOTE_FORM = {
    title: "Get an instant repair quote",
    fields: {
        deviceType: {
            label: "Device Type",
            placeholder: "Select device type",
            options: [
                {value: DeviceType.LAPTOP, label: "Laptop"},
                {value: DeviceType.DESKTOP, label: "Desktop"},
                {value: DeviceType.PRINTER, label: "Printer"}
            ]
        },
        issue: {
            label: "What's the issue?",
            placeholder: "Select problem"
        },
        email: {
            label: "Email",
            placeholder: "your@email.com"
        }
    },
    submitButton: "Get Quote"
}

// Services Overview Section
export const SERVICES_OVERVIEW = {
    title: "Our Repair Services",
    description: "We provide expert repair services for all your devices with quick turnaround times and quality parts.",
    services: [
        {
            icon: "laptop",
            title: "Laptop Repair",
            description: "From screen replacements to motherboard repairs, we fix all laptop issues with quality parts.",
            link: "/services"
        },
        {
            icon: "smartphone",
            title: "Smartphone Repair",
            description: "Cracked screens, battery issues, water damage - we'll get your phone working like new again.",
            link: "/services"
        },
        {
            icon: "printer",
            title: "Printer Repair",
            description: "Resolve printer issues, paper jams, connectivity problems, and more with our expert service.",
            link: "/services"
        },
        {
            icon: "wrench",
            title: "Hardware Upgrades",
            description: "Boost your device's performance with RAM upgrades, SSD installations, and more.",
            link: "/services"
        },
        {
            icon: "settings",
            title: "Software Solutions",
            description: "Virus removal, OS installation, data recovery, and general system optimization.",
            link: "/services"
        },
        {
            icon: "shield",
            title: "Maintenance Plans",
            description: "Preventative care plans to keep your devices running smoothly and extend their lifespan.",
            link: "/services"
        }
    ]
}

// How It Works Section
export const HOW_IT_WORKS = {
    title: "How It Works",
    description: "Our simple process makes getting your device repaired quick and hassle-free.",
    steps: [
        {
            icon: Search,
            title: "Request a Quote",
            description: "Tell us what's wrong with your device and get a free quote."
        },
        {
            icon: Truck,
            title: "Book & Drop Off",
            description: "Schedule an appointment and bring your device to our shop."
        },
        {
            icon: Wrench,
            title: "Expert Repair",
            description: "Our certified technicians will fix your device using quality parts."
        },
        {
            icon: CheckCircle,
            title: "Pick Up & Enjoy",
            description: "Collect your repaired device and get back to using it worry-free."
        }
    ]
}

// Why Choose Us Section
export const WHY_CHOOSE_US = {
    title: "Why Choose Us",
    description: "We pride ourselves on providing exceptional service and high-quality repairs.",
    benefits: [
        {
            icon: Clock,
            title: "Fast Turnaround",
            description: "Most repairs are completed the same day, so you're not without your device for long."
        },
        {
            icon: Shield,
            title: "90-Day Warranty",
            description: "All our repairs come with a 90-day warranty for your peace of mind."
        },
        {
            icon: CreditCard,
            title: "Competitive Pricing",
            description: "Quality repairs at fair prices with no hidden fees or surprises."
        },
        {
            icon: Users,
            title: "Certified Technicians",
            description: "Our repair experts are certified and have years of experience."
        },
        {
            icon: Settings,
            title: "Quality Parts",
            description: "We use only high-quality, genuine or OEM-grade replacement parts."
        },
        {
            icon: Eye,
            title: "Free Diagnostics",
            description: "We diagnose your device issues for free before any repairs begin."
        }
    ]
}

// Footer Content
export const FOOTER_CONTENT = {
    company: {
        name: "Laptop Care",
        description: "We provide expert repair services for all your devices with quick turnaround times and quality parts.",
        socialLinks: [
            {platform: "Facebook", url: "#", icon: "facebook"},
            {platform: "Instagram", url: "#", icon: "instagram"},
            {platform: "Twitter", url: "#", icon: "twitter"}
        ]
    },
    sections: [
        {
            title: "Popular Services",
            links: [
                {name: "Laptop Repair", href: "/services?device=LAPTOP"},
                {name: "Desktop Repair", href: "/services?device=DESKTOP"},
                {name: "Printer Repair", href: "/services?device=PRINTER"},
                {name: "Data Recovery", href: "/services?search=data+recovery"}
            ]
        },
        {
            title: "Company",
            links: [
                {name: "About Us", href: "/about"},
                {name: "Careers", href: "/careers"},
                {name: "Blog", href: "/blog"},
                {name: "Privacy Policy", href: "/privacy"},
                {name: "Terms & Conditions", href: "/terms"}
            ]
        },
        {
            title: "Contact",
            info: [
                {label: "Address", value: "Akshar Court, Crossroads Plaza, Westlands"},
                {label: "City", value: "Nairobi, Kenya"},
                {label: "Email", value: "enquiries@laptopcare.com"},
                {label: "Phone", value: "+254 741 546 004"}
            ]
        }
    ],
    copyright: "© 2025 Laptop Care. All rights reserved."
}