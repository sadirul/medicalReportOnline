import { LegalPageLayout } from '@/components/landing/legal-page-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function PrivacyPolicyPage() {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';

    return (
        <LegalPageLayout title="Privacy Policy">
            <p>
                {appName} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your
                information when you use our web application and related services.
            </p>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">1. Information We Collect</h2>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Personal Information: name, email address, phone number, payment details.</li>
                    <li>Usage Data: login activity, device information, interactions with our services.</li>
                    <li>Communication Data: WhatsApp, SMS, or email reminder preferences.</li>
                </ul>
            </section>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">2. How We Use Your Information</h2>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Manage accounts and permissions for staff and administrators.</li>
                    <li>Process subscriptions, billing records, and receipts.</li>
                    <li>Send reminders, product updates, and operational notifications.</li>
                    <li>Improve platform reliability, security, and user experience.</li>
                </ul>
            </section>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">3. Sharing of Information</h2>
                <p>
                    We do not sell personal information. We may share limited data with payment processors, notification providers, and legal authorities when
                    required by law.
                </p>
            </section>

            <section>
                <h2 className="mb-2 text-xl font-semibold text-slate-800">4. Data Security</h2>
                <p>
                    We apply industry-standard safeguards. While no system is absolutely secure, we continuously improve controls to protect stored and
                    transmitted data.
                </p>
            </section>
        </LegalPageLayout>
    );
}
