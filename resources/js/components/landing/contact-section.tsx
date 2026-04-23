import { Mail, MapPin, Phone } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface ContactSectionProps {
    appName: string;
}

interface ContactFormState {
    fullName: string;
    email: string;
    phone: string;
    message: string;
}

const initialFormState: ContactFormState = {
    fullName: '',
    email: '',
    phone: '',
    message: '',
};

const formSubmitAction = 'https://formsubmit.co/mymedilabmax@gmail.com';

export function ContactSection({ appName }: ContactSectionProps) {
    const [formState, setFormState] = useState<ContactFormState>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => !isSubmitting, [isSubmitting]);

    const validateForm = () => {
        const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};

        if (!formState.fullName.trim()) {
            nextErrors.fullName = 'Full name is required.';
        }

        if (!formState.email.trim()) {
            nextErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
            nextErrors.email = 'Enter a valid email address.';
        }

        if (!formState.phone.trim()) {
            nextErrors.phone = 'Phone number is required.';
        }

        if (!formState.message.trim()) {
            nextErrors.message = 'Please share your requirement.';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('idle');

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            const submitData = new FormData(event.currentTarget);
            submitData.set('name', formState.fullName.trim());
            submitData.set('email', formState.email.trim());
            submitData.set('phone', formState.phone.trim());
            submitData.set('message', formState.message.trim());
            submitData.set('_subject', `${appName} landing page inquiry`);

            await fetch(formSubmitAction, {
                method: 'POST',
                mode: 'no-cors',
                body: submitData,
            });

            setFormState(initialFormState);
            setStatus('success');
        } catch {
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 to-blue-900">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                <article className="rounded-2xl bg-linear-to-b from-blue-950/90 to-indigo-900/70 p-8">
                    <h2 className="text-4xl font-bold text-white">
                        Get in <span className="text-blue-300">Touch</span>
                    </h2>
                    <p className="mt-4 max-w-md text-slate-200">
                        Ready to transform your diagnostics operations? The {appName} team is here to help you schedule a personalized demo.
                    </p>
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-slate-100">
                            <span className="rounded-md bg-blue-500/20 p-2">
                                <Phone className="h-4 w-4" />
                            </span>
                            <span>+91 89188 28565</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-100">
                            <span className="rounded-md bg-fuchsia-500/20 p-2">
                                <Mail className="h-4 w-4" />
                            </span>
                            <span>mymedilabmax@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-100">
                            <span className="rounded-md bg-violet-500/20 p-2">
                                <MapPin className="h-4 w-4" />
                            </span>
                            <span>Kolkata, West Bengal, India</span>
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl bg-slate-100 p-6 shadow-2xl">
                    <h3 className="text-3xl font-semibold text-slate-900">Send us a Message</h3>
                    <form action={formSubmitAction} method="POST" onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                        <input type="hidden" name="_subject" value={`${appName} landing page inquiry`} />
                        <input type="hidden" name="_template" value="table" />
                        <input type="hidden" name="_captcha" value="false" />
                        <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
                        <div>
                            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                value={formState.fullName}
                                onChange={(event) => setFormState((previous) => ({ ...previous, fullName: event.target.value }))}
                                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                                placeholder="Enter your name"
                                autoComplete="name"
                            />
                            {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formState.email}
                                onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                value={formState.phone}
                                onChange={(event) => setFormState((previous) => ({ ...previous, phone: event.target.value }))}
                                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                                placeholder="Enter your phone"
                                autoComplete="tel"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label htmlFor="message" className="text-sm font-medium text-slate-700">
                                Message
                            </label>
                            <textarea
                                id="message"
                                value={formState.message}
                                onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
                                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                                placeholder="Tell us about your requirements"
                            />
                            {errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}
                        </div>

                        {status === 'success' && <p className="text-sm text-emerald-700">Message sent successfully. We will get back to you within 24 hours.</p>}
                        {status === 'error' && <p className="text-sm text-rose-700">Message could not be sent. Please try again.</p>}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="h-11 w-full rounded-md bg-linear-to-r from-blue-500 to-violet-500 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </article>
            </div>
        </section>
    );
}
