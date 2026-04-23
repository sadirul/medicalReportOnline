import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface LandingNavbarProps {
    appName: string;
}

const sectionLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
];

export function LandingNavbar({ appName }: LandingNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = Boolean(auth?.user);
    const authLinkHref = isLoggedIn ? '/dashboard' : route('login');
    const authLinkLabel = isLoggedIn ? 'Dashboard' : 'Log in';

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link href={route('home')} className="inline-flex items-center text-base font-semibold text-slate-900">
                    <img src="/assets/images/icon-bg-removed.png" alt={`${appName} logo`} className="h-12 w-auto max-w-none object-contain" />
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {sectionLinks.map((link) => (
                        <a key={link.label} href={link.href} className="text-sm text-slate-600 transition hover:text-slate-900">
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <Link href={authLinkHref} className="text-sm font-medium text-slate-700 transition hover:text-slate-900">
                        {authLinkLabel}
                    </Link>
                    <Link href={route('register')} className="rounded-md bg-linear-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white">
                        Signup
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen((value) => !value)}
                    className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 md:hidden"
                    aria-label="Toggle navigation"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {isMenuOpen && (
                <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
                    <nav className="flex flex-col gap-3">
                        {sectionLinks.map((link) => (
                            <a key={link.label} href={link.href} className="text-sm text-slate-700">
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-2 border-t border-slate-200 pt-3">
                            <div className="flex gap-4">
                                <Link href={authLinkHref} className="text-sm text-slate-700">
                                    {authLinkLabel}
                                </Link>
                                <Link href={route('register')} className="text-sm font-semibold text-slate-900">
                                    Signup
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
