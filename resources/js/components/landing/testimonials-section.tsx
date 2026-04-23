import { testimonials } from '@/components/landing/data';

interface TestimonialsSectionProps {
    appName: string;
}

export function TestimonialsSection({ appName }: TestimonialsSectionProps) {
    const renderQuote = (quote: string) => {
        const marker = '{appName}';

        if (!quote.includes(marker)) {
            return quote;
        }

        const [before, after] = quote.split(marker);

        return (
            <>
                {before}
                <strong>{appName}</strong>
                {after}
            </>
        );
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2">
                {testimonials.map((item) => (
                    <article key={item.author} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm leading-relaxed text-slate-700">"{renderQuote(item.quote)}"</p>
                        <div className="mt-4">
                            <p className="font-semibold text-slate-900">{item.author}</p>
                            <p className="text-sm text-slate-600">{item.role}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
