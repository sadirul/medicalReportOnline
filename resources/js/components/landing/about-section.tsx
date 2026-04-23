import { aboutHighlights } from '@/components/landing/data';

interface AboutSectionProps {
    appName: string;
}

export function AboutSection({ appName }: AboutSectionProps) {
    return (
        <section id="about" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">About {appName}</h2>
                    <p className="mt-4 text-slate-600">
                        {appName} is a Medical Diagnocare Software solution focused on helping labs and clinics deliver quality diagnostic reports with speed,
                        consistency, and confidence.
                    </p>
                    <p className="mt-3 text-slate-600">
                        Developed by Quantynix Solutions, the platform combines clinical-friendly workflows with modern technology to simplify everyday diagnostic
                        operations.
                    </p>
                </article>
                <div className="grid gap-4">
                    {aboutHighlights.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="inline-flex rounded-md bg-violet-500/15 p-2 text-violet-300">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
