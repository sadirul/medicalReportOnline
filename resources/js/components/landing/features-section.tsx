import { landingFeatures } from '@/components/landing/data';

interface FeaturesSectionProps {
    appName: string;
}

export function FeaturesSection({ appName }: FeaturesSectionProps) {
    return (
        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Powerful Features for {appName}</h2>
                <p className="mt-3 text-slate-600">
                    Purpose-built modules for diagnostics teams to manage reports, billing, doctor workflows, and patient communication from one place.
                </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {landingFeatures.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <article
                            key={feature.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                        >
                            <span className="inline-flex rounded-lg bg-blue-500/15 p-2 text-blue-300">
                                <Icon className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
