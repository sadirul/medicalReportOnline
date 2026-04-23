import { LegalPageLayout } from '@/components/landing/legal-page-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function CookiePolicyPage() {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';

    return (
        <LegalPageLayout title="Cookie Policy">
            <p>
                <strong>{appName}</strong> may use cookies and similar technologies to improve login sessions, security, analytics, and overall user experience
                across the web interface.
            </p>
            <p>
                Essential cookies are required for core functionality. Optional analytics cookies may help us improve product performance and user journeys.
            </p>
            <p>
                You can manage cookie preferences using your browser settings. Disabling some cookies may affect specific features.
            </p>
            <p>
                Continued use of the platform indicates consent to cookie usage consistent with this policy.
            </p>
        </LegalPageLayout>
    );
}
