import { moduleCards } from '@/components/landing/data';

interface ModulesSectionProps {
    appName: string;
}

export function ModulesSection({ appName }: ModulesSectionProps) {
    return (
        <section id="community" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Built for every diagnocare setup</h2>
                    <p className="mt-4 text-slate-600">
                        Whether you run a pathology lab or a distributed clinic network, <strong>{appName}</strong> adapts to your workflow without operational
                        overhead.
                    </p>
                </div>
                <div className="grid gap-4">
                    {moduleCards.map((module) => (
                        <article
                            key={module.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                        >
                            <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
