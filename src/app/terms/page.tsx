import Link from "next/link";
import {Navigation} from '@/components/navigation';
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navigation/>

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Button variant="ghost" asChild className="h-auto p-0">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                                <ArrowLeft className="h-4 w-4"/>
                                Back to Home
                            </Link>
                        </Button>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                            Terms and Conditions
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Laptop Care Ltd
                        </p>
                        <p className="text-sm mt-2 text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Terms Content */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Service Agreement</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                By submitting a device for repair, the customer agrees to the terms outlined herein.
                                We will diagnose and repair the device to the best of our ability based on the
                                customer&#39;s description of the issue.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Estimates and Charges</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                An initial diagnostic fee may be required. Repair costs will be estimated before
                                proceeding,
                                and customer approval is required. Payment must be made in full upon completion of the
                                repair.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Repair Timeframe</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                Repair times may vary based on the complexity of the issue and availability of
                                replacement parts.
                                Any delays will be communicated promptly.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Protection and
                                Liability</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                While we take precautions to protect data, we are not responsible for data loss during
                                repairs.
                                Customers are advised to back up all important files before submitting their device.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Warranty on Repairs</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                We offer a limited warranty on motherboard repairs for 30 days after service completion.
                                The warranty does not cover accidental damage, liquid damage, power damage or misuse.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Non-Repairable Devices</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                If a device is deemed non-repairable or the customer chooses not to proceed,
                                a diagnostic fee will still apply.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Abandoned Devices</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                Devices not collected within 60 days of repair completion will be subject to storage
                                fees
                                of Kes. 500 daily or disposal without notifying the client.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Limitation of Liability</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                Our shop is not liable for any indirect or consequential damages resulting from repairs,
                                delays, or hardware failures beyond our control.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Customer Confirmation Upon
                                Collection</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                Upon receiving the repaired device, the customer is required to inspect and confirm that
                                the laptop is functioning as expected. Any concerns or issues must be raised before
                                leaving
                                the premises. Once the customer has left the shop, Laptop Care Ltd or received the
                                laptop
                                via delivery of his/her choice, will not be held accountable for any subsequent issues
                                or damages.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Customer Consent</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                By engaging our services, the customer agrees to these terms and conditions.
                                These terms govern all services provided by Laptop Care Ltd.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Customer-Supplied Parts</h2>
                            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                                <li>We are not responsible for the functionality, damage or compatibility of
                                    customer-supplied parts.
                                </li>
                                <li>No warranty is provided for services using customer parts.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Privacy Policy</h2>
                            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                                <li>Any customer data or personal information is handled in accordance with our Privacy
                                    Policy.
                                </li>
                                <li>We do not access personal files unless required for the repair and with your
                                    consent.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Governing Law</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                These Terms are governed by the laws of Kenya. Disputes shall be resolved through
                                arbitration or small claims court as applicable.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Payment Terms</h2>
                            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                                <li>Payment is due upon completion of service.</li>
                                <li>Payments can be done through the channels shared by our sales
                                    representatives/cashiers.
                                </li>
                                <li>Devices will not be released until full payment is received.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Refund Policy</h2>
                            <p className="text-foreground/90 leading-relaxed">
                                Refunds will only be granted under specific circumstances where Laptop Care Ltd is
                                unable
                                to complete the repair due to an error on our part. Diagnostic fees are non-refundable.
                                If a customer experiences issues with the repaired device, they must report them before
                                leaving the shop. Once the customer has left, refund requests will not be accepted.
                                Additionally, refunds do not apply to services where parts were replaced unless those
                                parts are found to be defective within the warranty period.
                            </p>
                        </section>
                    </div>

                    {/* Footer Contact Info */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Information</h3>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>Akshar Court, Crossroads Plaza, Westlands</p>
                                <p>Nairobi, Kenya</p>
                                <p>Email:
                                    <a href="mailto:enquiries@laptopcare.com"
                                       className="text-primary hover:text-primary-hover transition-colors underline">
                                        enquiries@laptopcare.com
                                    </a>
                                </p>
                                <p> Phone:
                                    <a href="tel:+254741546004"
                                       className="text-primary hover:text-primary-hover transition-colors underline">
                                        +254 741 546 004
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}