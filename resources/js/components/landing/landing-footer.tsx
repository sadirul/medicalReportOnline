import { Facebook, Linkedin } from 'lucide-react';

import { legalLinks, supportLinks } from '@/components/landing/data';

interface LandingFooterProps {
    appName: string;
}

export function LandingFooter({ appName }: LandingFooterProps) {
    return (
        <footer id="legal" className="border-t border-slate-800 bg-[#060f2d]">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
                <div>
                    <div className="inline-flex items-center gap-2 text-white">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-linear-to-r from-blue-500 to-violet-500 font-bold">
                            M
                        </span>
                        <span className="text-lg font-semibold">{appName}</span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">
                        Empowering diagnostic centers with modern software to streamline reports, operations, and patient communication.
                    </p>
                    {/* <div className="mt-5 flex items-center gap-2">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-slate-700 bg-slate-800/60 p-2 text-slate-200 hover:bg-slate-700"
                        >
                            <Facebook className="h-4 w-4" />
                        </a>
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-slate-700 bg-slate-800/60 p-2 text-slate-200 hover:bg-slate-700"
                        >
                            <span className="text-sm font-semibold">t</span>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-slate-700 bg-slate-800/60 p-2 text-slate-200 hover:bg-slate-700"
                        >
                            <Linkedin className="h-4 w-4" />
                        </a>
                    </div> */}
                </div>

                <div>
                    <h3 className="text-base font-semibold text-white">Support</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        {supportLinks.map((link) => (
                            <li key={link.label}>
                                <a href={link.href} className="transition hover:text-white">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-base font-semibold text-white">Legal</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        {legalLinks.map((link) => (
                            <li key={link.label}>
                                <a href={link.href} className="transition hover:text-white">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-800">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 text-sm text-slate-300 sm:px-6 lg:px-8">
                    <p>
                        © 2026 {appName} by{' '}
                        <a href="https://quantynix.com/" target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200">
                            Quantynix Solutions
                        </a>
                        . All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
