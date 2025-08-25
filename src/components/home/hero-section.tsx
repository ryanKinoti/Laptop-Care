'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {ArrowRight, CheckCircle} from 'lucide-react'
import {HERO_CONTENT, QUOTE_FORM} from '@/lib/constants/home'
import type {CategoryWithServices} from '@/lib/prisma/service'

interface HeroSectionProps {
    categories: CategoryWithServices[]
}

export function HeroSection({categories}: HeroSectionProps) {
    const [formData, setFormData] = useState({
        deviceType: '',
        categoryId: '',
        email: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement quote request logic
        console.log('Quote request:', formData)
        alert('Quote request submitted! We\'ll get back to you soon.')
    }

    const handleDeviceTypeChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            deviceType: value,
            categoryId: '' // Reset category when device type changes
        }))
    }

    // Filter categories based on selected device type
    const filteredCategories = categories.filter(category =>
        category.services.some(service =>
            formData.deviceType ? service.device === formData.deviceType : true
        )
    )

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Hero Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <Badge variant="secondary" className="w-fit">
                                {HERO_CONTENT.badge}
                            </Badge>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                {HERO_CONTENT.title.split(HERO_CONTENT.highlight).map((part, index) => (
                                    <span key={index}>
                                        {part}
                                        {index === 0 && (
                                            <span className="text-primary">
                                                {HERO_CONTENT.highlight}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </h1>

                            <p className="text-lg text-muted-foreground max-w-xl">
                                {HERO_CONTENT.description}
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="group">
                                {HERO_CONTENT.cta.primary}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                            </Button>
                            <Button variant="outline" size="lg">
                                {HERO_CONTENT.cta.secondary}
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-6">
                            {HERO_CONTENT.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary"/>
                                    <span className="text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Quote Form */}
                    <div className="lg:pl-8">
                        <Card className="w-full max-w-md mx-auto lg:mx-0 shadow-xl">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-6 text-center">
                                    {QUOTE_FORM.title}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Device Type Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {QUOTE_FORM.fields.deviceType.label}
                                        </label>
                                        <Select onValueChange={handleDeviceTypeChange} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder={QUOTE_FORM.fields.deviceType.placeholder}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {QUOTE_FORM.fields.deviceType.options.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Issue/Category Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {QUOTE_FORM.fields.issue.label}
                                        </label>
                                        <Select
                                            onValueChange={(value) => setFormData(prev => ({
                                                ...prev,
                                                categoryId: value
                                            }))}
                                            disabled={!formData.deviceType}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={QUOTE_FORM.fields.issue.placeholder}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {QUOTE_FORM.fields.email.label}
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder={QUOTE_FORM.fields.email.placeholder}
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" size="lg">
                                        {QUOTE_FORM.submitButton}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}