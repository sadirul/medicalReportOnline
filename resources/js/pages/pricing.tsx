import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface PricingPageProps {
    yearly_package: {
        amount_formatted: string;
        currency: string;
        label: string;
    };
}

export default function PricingPage({ yearly_package }: PricingPageProps) {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';
    const amountDisplay = yearly_package.currency === 'INR' ? `₹${yearly_package.amount_formatted}` : `${yearly_package.currency} ${yearly_package.amount_formatted}`;

    return (
        <>
            <Head title="Pricing" />
            <div className="min-h-screen bg-gray-100">
                <LandingNavbar appName={appName} />

                <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-4xl font-bold text-slate-900">Pricing</h1>
                        <p className="mt-3 text-slate-600">Simple yearly plan powered by your environment configuration.</p>

                        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-8">
                            <p className="text-sm font-medium text-blue-700">{yearly_package.label}</p>
                            <p className="mt-2 text-5xl font-bold text-slate-900">{amountDisplay}</p>
                            <p className="mt-2 text-sm text-slate-600">per year</p>
                        </div>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href={route('login')} className="rounded-md bg-linear-to-r from-blue-500 to-violet-500 px-5 py-2.5 font-semibold text-white">
                                Log in to Subscribe
                            </Link>
                            <Link href={route('home')} className="rounded-md border border-slate-300 px-5 py-2.5 font-semibold text-slate-700">
                                Back to Home
                            </Link>
                        </div>
                    </section>
                </main>

                <LandingFooter appName={appName} />
            </div>
        </>
    );
}
