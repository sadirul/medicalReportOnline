import { processSteps } from '@/components/landing/data';

interface ProcessSectionProps {
    appName: string;
}

export function ProcessSection({ appName }: ProcessSectionProps) {
    return (
        <section className="border-y border-slate-200 bg-slate-50 py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                        How <strong>{appName}</strong> works
                    </h2>
                    <p className="mt-3 text-slate-600">
                        A practical workflow from patient intake to report delivery with clear hand-offs across teams.
                    </p>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {processSteps.map((step, index) => (
                        <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold tracking-widest text-blue-300">STEP {index + 1}</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
