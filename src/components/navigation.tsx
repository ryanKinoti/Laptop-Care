'use client'

import {useState, useEffect} from 'react'
import {useTheme} from "next-themes"
import Image from 'next/image'
import Link from 'next/link'
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink
} from "@/components/ui/navigation-menu"
import {AuthButtons} from "@/components/auth-buttons"
import {useNavigationStore} from "@/stores/navigation-store"
import {Moon, Sun, Package, Menu, X} from "lucide-react"
import {SessionProvider} from "next-auth/react"

export function ThemeToggle() {
    const {theme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Skeleton className="h-9 w-9"/>
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
            <Moon
                className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

function NavigationContent() {
    const {isMobile, isMenuOpen, setIsMobile, toggleMenu} = useNavigationStore()

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [setIsMobile])

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/lcs_main_logo.png"
                        alt="Laptop Care Services"
                        width={100}
                        height={38}
                        className="bg-white rounded-md w-auto h-auto"
                        priority
                    />
                    <span className="hidden font-bold sm:inline-block">
                        Laptop Care Services
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {!isMobile && (
                    <div className="flex items-center space-x-6">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        href="/services"
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                                        Services
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        href="/terms"
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                                        Terms
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <div className="flex items-center space-x-2">
                            <ThemeToggle/>
                            <Button variant="outline" size="sm">
                                <Package className="mr-2 h-4 w-4"/>
                                Track Order
                            </Button>
                            <AuthButtons/>
                        </div>
                    </div>
                )}

                {/* Mobile Menu Button */}
                {isMobile && (
                    <div className="flex items-center space-x-2">
                        <ThemeToggle/>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleMenu}
                            aria-label="Toggle menu">
                            {isMenuOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile Navigation Menu */}
            {isMobile && isMenuOpen && (
                <div className="border-t bg-background/95 backdrop-blur">
                    <div className="container px-4 py-4">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/services"
                                className="text-sm font-medium transition-colors hover:text-primary"
                                onClick={toggleMenu}>
                                Services
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm font-medium transition-colors hover:text-primary"
                                onClick={toggleMenu}>
                                Terms
                            </Link>
                            <div className="flex flex-col space-y-2 pt-2 border-t">
                                <Button variant="outline" size="sm" className="justify-start">
                                    <Package className="mr-2 h-4 w-4"/>
                                    Track Order
                                </Button>
                                <div className="flex justify-start">
                                    <AuthButtons/>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    )
}

export function Navigation() {
    return (
        <SessionProvider>
            <NavigationContent/>
        </SessionProvider>
    )
}