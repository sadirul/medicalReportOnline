import { LegalPageLayout } from '@/components/landing/legal-page-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function TermsAndConditionsPage() {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';

    return (
        <LegalPageLayout title="Terms and Conditions">
            <p>
                By using <strong>{appName}</strong>, you agree to use the platform only for lawful diagnostic and administrative workflows. You are responsible
                for keeping account credentials secure and accurate.
            </p>
            <p>
                Subscription plans, usage limits, and service features may vary over time. Continued usage after updates implies acceptance of revised terms.
            </p>
            <p>
                You must ensure that all patient-related records entered into the system comply with applicable healthcare regulations and internal policies.
            </p>
            <p>
                Quantynix Solutions reserves the right to suspend access for misuse, security threats, or non-compliance with terms.
            </p>
        </LegalPageLayout>
    );
}
