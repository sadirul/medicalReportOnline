import { LegalPageLayout } from '@/components/landing/legal-page-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function RefundPolicyPage() {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';

    return (
        <LegalPageLayout title="Refund Policy">
            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">1. General Policy</h2>
                <p>
                    Payments made through {appName} are final unless otherwise stated in this Refund Policy. We encourage users to review service details before
                    making payment.
                </p>
            </section>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">2. Eligibility for Refunds</h2>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Refunds may be issued only in cases of duplicate payment or verified billing errors.</li>
                    <li>Services already rendered are non-refundable.</li>
                    <li>Requests must be submitted within 7 working days from the transaction date.</li>
                </ul>
            </section>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">3. Refund Process</h2>
                <p>
                    To request a refund, contact our support team with transaction details. Once approved, refunds are credited to the original payment method
                    within 7-10 business days.
                </p>
            </section>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">4. Non-Refundable Situations</h2>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Change of mind after successful activation.</li>
                    <li>Failure to use subscribed services during the billing period.</li>
                    <li>Violation of service terms causing account suspension.</li>
                </ul>
            </section>
        </LegalPageLayout>
    );
}
