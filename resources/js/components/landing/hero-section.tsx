import { Link } from '@inertiajs/react';
import { ArrowRight, Microscope } from 'lucide-react';

import { landingStats } from '@/components/landing/data';

interface HeroSectionProps {
    appName: string;
}

export function HeroSection({ appName }: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-20">
                <div className="relative z-10 space-y-7">
                    <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-semibold tracking-wide text-blue-700">
                        <Microscope className="h-3.5 w-3.5" />
                        Medical Diagnocare Software
                    </p>
                    <h1 className="text-4xl leading-tight font-bold text-slate-900 sm:text-5xl">
                        Smarter diagnostics.
                        <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Faster clinical decisions.</span>
                    </h1>
                    <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        {appName} helps diagnostic centers streamline report workflows, reduce turnaround time, and deliver better patient experiences from
                        collection to final release.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 rounded-md bg-linear-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02]"
                        >
                            Book a Demo
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <Link href="/#about" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
                            About Us
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {landingStats.map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -right-10 top-10 h-40 w-40 animate-pulse rounded-full bg-violet-500/20 blur-2xl" />
                    <div className="grid gap-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                            <img
                                src="/assets/images/landing-page/microscope.png"
                                alt="Scientist using microscope in diagnostics lab"
                                className="h-60 w-full rounded-xl object-cover transition duration-500 hover:scale-[1.03]"
                                loading="lazy"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                                <img
                                    src="/assets/images/landing-page/test-sample1.png"
                                    alt="Diagnostic machine setup"
                                    className="h-36 w-full rounded-xl object-cover transition duration-500 hover:scale-[1.04]"
                                    loading="lazy"
                                />
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                                <img
                                    src="/assets/images/landing-page/test-sample2.png"
                                    alt="Microscope in diagnostics lab"
                                    className="h-36 w-full rounded-xl object-cover transition duration-500 hover:scale-[1.04]"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
