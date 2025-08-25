import {Card, CardContent} from '@/components/ui/card'
import {WHY_CHOOSE_US} from '@/lib/constants/home'

export function WhyChooseUs() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {WHY_CHOOSE_US.title}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {WHY_CHOOSE_US.description}
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {WHY_CHOOSE_US.benefits.map((benefit, index) => {
                        const Icon = benefit.icon

                        return (
                            <Card
                                key={index}
                                className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className="mb-4">
                                        <div
                                            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                            <Icon className="h-6 w-6 text-primary"/>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}