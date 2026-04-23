import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, BellRing, Clock3, FileText, FlaskConical, Microscope, ShieldCheck, Stethoscope, UserRoundCheck } from 'lucide-react';

export interface LandingStat {
    label: string;
    value: string;
}

export interface LandingFeature {
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface LandingStep {
    title: string;
    description: string;
}

export interface LandingModule {
    title: string;
    description: string;
}

export interface Testimonial {
    quote: string;
    author: string;
    role: string;
}

export const supportLinks = [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'Community', href: '#community' },
];

export const legalLinks = [
    { label: 'Privacy Policy', href: '/legal/privacy-policy' },
    { label: 'Terms and Condition', href: '/legal/terms-and-conditions' },
    { label: 'Cookie Policy', href: '/legal/cookie-policy' },
    { label: 'Refund Policy', href: '/legal/refund-policy' },
];

export const landingStats: LandingStat[] = [
    { label: 'Diagnostic Centers', value: '500+' },
    { label: 'Reports Managed', value: '120K+' },
    { label: 'Uptime Reliability', value: '99.9%' },
    { label: 'Avg. Faster Turnaround', value: '40%' },
];

export const landingFeatures: LandingFeature[] = [
    {
        title: 'Smart Report Workflow',
        description: 'Create, review, and release reports with role-based approvals in a single flow.',
        icon: FileText,
    },
    {
        title: 'Machine-Friendly Integrations',
        description: 'Connect analyzer output with structured report formats to reduce manual entry errors.',
        icon: Microscope,
    },
    {
        title: 'Automated Patient Updates',
        description: 'Send release alerts and billing follow-ups over WhatsApp and SMS with templates.',
        icon: BellRing,
    },
    {
        title: 'Doctor-Centric Dashboard',
        description: 'Track pending, released, and department-wise performance metrics from one dashboard.',
        icon: BarChart3,
    },
    {
        title: 'Secure Cloud Access',
        description: 'Protect sensitive patient records with encrypted storage and controlled user access.',
        icon: ShieldCheck,
    },
    {
        title: 'Faster Turnaround Time',
        description: 'Reduce reporting delays using reusable panels and standardized diagnostic templates.',
        icon: Clock3,
    },
];

export const processSteps: LandingStep[] = [
    {
        title: 'Collect & Register',
        description: 'Capture patient details and test requests with error-resistant digital intake.',
    },
    {
        title: 'Process & Verify',
        description: 'Record diagnostics, verify values, and flag abnormal findings for medical review.',
    },
    {
        title: 'Release & Notify',
        description: 'Publish final reports and notify patients and referring doctors instantly.',
    },
    {
        title: 'Track & Improve',
        description: 'Review trend analytics to improve productivity and quality outcomes each month.',
    },
];

export const moduleCards: LandingModule[] = [
    {
        title: 'Pathology Labs',
        description: 'Manage CBC, biochemistry, hormone profiles, and custom packages with reusable templates.',
    },
    {
        title: 'Radiology Centers',
        description: 'Organize imaging findings with fast report drafting and doctor sign-off workflows.',
    },
    {
        title: 'Multi-Clinic Networks',
        description: 'Share reports between locations while preserving access control and audit traces.',
    },
];

export const testimonials: Testimonial[] = [
    {
        quote: '{appName} cut our daily report turnaround almost in half and helped us eliminate manual spreadsheet mistakes.',
        author: 'Dr. A. Mukherjee',
        role: 'Diagnostic Lab Director',
    },
    {
        quote: 'The dashboard gives us complete visibility across departments. Follow-ups and billing became much easier.',
        author: 'R. Saha',
        role: 'Operations Lead, Multispecialty Clinic',
    },
];

export const aboutHighlights = [
    {
        title: 'Built for medical operations',
        description: 'Designed to support busy pathology and diagnostic teams with practical workflows.',
        icon: Activity,
    },
    {
        title: 'Aligned with doctors and technicians',
        description: 'UI and modules are optimized for fast reporting and clear clinical communication.',
        icon: Stethoscope,
    },
    {
        title: 'Reliable support from Quantynix',
        description: 'Deployment, onboarding, and updates are managed with long-term product support.',
        icon: UserRoundCheck,
    },
    {
        title: 'Scales as your practice grows',
        description: 'From single centers to multi-branch setups with secure data access and performance tracking.',
        icon: FlaskConical,
    },
];
