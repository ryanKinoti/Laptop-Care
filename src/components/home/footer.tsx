import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter } from 'lucide-react'
import { FOOTER_CONTENT } from '@/lib/constants/home'

const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
} as const

export function Footer() {
    return (
        <footer className="bg-card border-t">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src="/lcs_main_logo.png"
                                alt="Laptop Care Services"
                                width={90}
                                height={32}
                                className="bg-white rounded"
                            />
                            <span className="text-xl font-bold">
                                {FOOTER_CONTENT.company.name}
                            </span>
                        </div>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            {FOOTER_CONTENT.company.description}
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex gap-4">
                            {FOOTER_CONTENT.company.socialLinks.map((social) => {
                                const Icon = socialIcons[social.icon as keyof typeof socialIcons]
                                return (
                                    <Link
                                        key={social.platform}
                                        href={social.url}
                                        className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                                        aria-label={social.platform}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Footer Links */}
                    {FOOTER_CONTENT.sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {/* Handle both links and info sections */}
                                {'links' in section && section.links ? 
                                    section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-muted-foreground hover:text-foreground transition-colors">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))
                                    :
                                    'info' in section && section.info &&
                                    section.info.map((item) => (
                                        <li key={item.label} className="text-muted-foreground">
                                            <div className="space-y-1">
                                                {item.label && (
                                                    <p className="text-sm text-muted-foreground/70">
                                                        {item.label}
                                                    </p>
                                                )}
                                                <p>{item.value}</p>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Copyright */}
                <div className="border-t py-6">
                    <div className="flex flex-col md:flex-row items-center justify-center text-sm text-muted-foreground">
                        <p>{FOOTER_CONTENT.copyright}</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}