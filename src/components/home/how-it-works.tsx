import {HOW_IT_WORKS} from '@/lib/constants/home'

export function HowItWorks() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {HOW_IT_WORKS.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {HOW_IT_WORKS.description}
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Lines - Hidden on mobile */}
                    <div className="hidden lg:block absolute top-20 left-0 right-0 h-px bg-border">
                        <div className="absolute left-1/4 top-0 w-1/2 h-px bg-border"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {HOW_IT_WORKS.steps.map((step, index) => {
                            const Icon = step.icon

                            return (
                                <div key={index} className="relative text-center">
                                    {/* Step Number */}
                                    <div className="relative mb-6 flex justify-center">
                                        <div
                                            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
                                            <Icon className="h-8 w-8 text-primary-foreground"/>
                                        </div>
                                        <div
                                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Mobile connector line */}
                                    {index < HOW_IT_WORKS.steps.length - 1 && (
                                        <div className="lg:hidden flex justify-center mt-8 mb-4">
                                            <div className="w-px h-8 bg-border"></div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}