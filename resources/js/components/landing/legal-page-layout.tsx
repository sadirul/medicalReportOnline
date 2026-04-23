import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { type SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface LegalPageLayoutProps {
    title: string;
    children: ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100">
                <LandingNavbar appName={appName} />
                <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                        <h1 className="text-center text-4xl font-bold text-slate-800">
                            {title} - {appName}
                        </h1>
                        <p className="mt-3 text-center text-sm text-slate-500">Last Updated: 02/01/2026</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                            <Link href={route('home')} className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100">
                                Back to Home
                            </Link>
                            <Link href="/#about" className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100">
                                About Us
                            </Link>
                        </div>
                        <article className="mt-8 space-y-6 leading-relaxed text-slate-700">{children}</article>
                    </div>
                </main>
                <LandingFooter appName={appName} />
            </div>
        </>
    );
}
