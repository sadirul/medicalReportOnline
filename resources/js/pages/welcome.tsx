import { AboutSection } from '@/components/landing/about-section';
import { ContactSection } from '@/components/landing/contact-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { ModulesSection } from '@/components/landing/modules-section';
import { ProcessSection } from '@/components/landing/process-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome() {
    const { name } = usePage<SharedData>().props;
    const appName = name || 'Laravel';

    useEffect(() => {
        const scrollToHash = () => {
            const hash = window.location.hash;
            if (!hash) {
                return;
            }

            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        // Delay a tick so sections are fully rendered before scroll.
        const timeoutId = window.setTimeout(scrollToHash, 50);
        window.addEventListener('hashchange', scrollToHash);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener('hashchange', scrollToHash);
        };
    }, []);

    return (
        <>
            <Head title="Home" />
            <div className="min-h-screen bg-white">
                <LandingNavbar appName={appName} />
                <main>
                    <HeroSection appName={appName} />
                    <FeaturesSection appName={appName} />
                    <ProcessSection appName={appName} />
                    <ModulesSection appName={appName} />
                    <AboutSection appName={appName} />
                    <TestimonialsSection appName={appName} />
                    <ContactSection appName={appName} />
                </main>
                <LandingFooter appName={appName} />
            </div>
        </>
    );
}
