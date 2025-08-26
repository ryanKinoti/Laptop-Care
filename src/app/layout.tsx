import {SpeedInsights} from '@vercel/speed-insights/next';
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "@/lib/styles/globals.css";
import React from "react";
import {ThemeProvider} from "@/components/theme-provider"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Laptop Care Services - Expert Device Repair and Sales",
    description: "Professional laptop and device repair services with fast turnaround times and quality parts.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
            <SpeedInsights/>
        </ThemeProvider>
        </body>
        </html>
    );
}
