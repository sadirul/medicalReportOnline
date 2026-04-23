import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Sparkles } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subscription',
        href: '/subscription',
    },
];

function loadRazorpayScript(): Promise<void> {
    if (window.Razorpay) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Razorpay script failed')), { once: true });

            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.dataset.razorpayCheckout = '1';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Razorpay script failed'));
        document.body.appendChild(script);
    });
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function SubscriptionIndex({
    yearly_package,
    razorpay_key,
    subscription_expired,
    expiry_datetime,
}: {
    yearly_package: {
        amount_paise: number;
        amount_formatted: string;
        currency: string;
        billing_period: string;
        label: string;
    };
    razorpay_key: string;
    subscription_expired: boolean;
    expiry_datetime?: string | null;
}) {
    const { auth, flash } = usePage<SharedData>().props;
    const [scriptReady, setScriptReady] = useState(Boolean(window.Razorpay));
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRazorpayScript()
            .then(() => setScriptReady(true))
            .catch(() => setError('Unable to load payment checkout. Check your connection and try again.'));
    }, []);

    const startPayment = useCallback(async () => {
        setError(null);

        if (!razorpay_key) {
            setError('Payment gateway is not configured. Please contact support.');

            return;
        }

        if (!window.Razorpay) {
            setError('Checkout is still loading. Please wait a moment.');

            return;
        }

        setPaying(true);

        try {
            const orderRes = await fetch(route('subscription.order'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({}),
            });

            const orderPayload = (await orderRes.json()) as {
                order_id?: string;
                amount?: number;
                currency?: string;
                key?: string;
                message?: string;
            };

            if (!orderRes.ok || !orderPayload.order_id) {
                setPaying(false);
                setError(orderPayload.message ?? 'Could not start payment. Please try again.');

                return;
            }

            const user = auth.user;
            const appName = import.meta.env.VITE_APP_NAME ?? 'Medical Report Online';

            const options: Record<string, unknown> = {
                key: orderPayload.key ?? razorpay_key,
                amount: orderPayload.amount ?? yearly_package.amount_paise,
                currency: orderPayload.currency ?? yearly_package.currency,
                order_id: orderPayload.order_id,
                name: appName,
                description: yearly_package.label,
                prefill: {
                    email: user.email,
                    contact: user.mobile ?? undefined,
                    name: user.full_name ?? user.name,
                },
                theme: { color: '#2563eb' },
                handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                    try {
                        const verifyRes = await fetch(route('subscription.verify'), {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken(),
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyPayload = (await verifyRes.json()) as { redirect?: string; message?: string };

                        if (!verifyRes.ok) {
                            setPaying(false);
                            setError(verifyPayload.message ?? 'Payment verification failed.');

                            return;
                        }

                        if (verifyPayload.redirect) {
                            router.visit(verifyPayload.redirect);
                        } else {
                            router.visit(route('dashboard'));
                        }
                    } catch {
                        setPaying(false);
                        setError('Payment verification failed. If you were charged, contact support with your receipt.');
                    }
                },
                modal: {
                    ondismiss: () => setPaying(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            setPaying(false);
            setError('Something went wrong starting checkout. Please try again.');
        }
    }, [auth.user, razorpay_key, yearly_package]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        void startPayment();
    };

    const currencyLabel = yearly_package.currency === 'INR' ? '₹' : `${yearly_package.currency} `;
    const periodLabel = yearly_package.billing_period === 'year' ? 'per year' : yearly_package.billing_period;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription" />

            <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl sm:p-10">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-200/90">
                                <Sparkles className="h-4 w-4" aria-hidden />
                                Secure checkout with Razorpay
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Keep your clinic online</h1>
                            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                                {subscription_expired
                                    ? 'Your trial or subscription has ended. Renew with the annual plan to continue using reports, departments, and the rest of your workspace without interruption.'
                                    : 'You can renew early anytime. Your new year is added on top of your current access period.'}
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-right backdrop-blur-md">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Yearly plan</p>
                            <p className="text-3xl font-bold tabular-nums">
                                {currencyLabel}
                                {yearly_package.amount_formatted}
                            </p>
                            <p className="text-xs text-slate-400">{periodLabel}</p>
                        </div>
                    </div>
                </div>

                {(flash?.status || error) && (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm ${
                            error || flash?.status_type === 'error'
                                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
                        }`}
                        role="status"
                    >
                        {error ?? flash?.status}
                    </div>
                )}

                <Card className="border-border/80 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CreditCard className="h-5 w-5 text-primary" aria-hidden />
                            {yearly_package.label}
                        </CardTitle>
                        <CardDescription>
                            {expiry_datetime
                                ? `Current access ends: ${new Date(expiry_datetime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.`
                                : 'Complete payment to activate a full year of access.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                            {[
                                'Unlimited report workflows for your clinic',
                                'Departments, investigations, and PDF delivery',
                                'Inter-clinic sharing tools you already use',
                            ].map((text) => (
                                <li key={text} className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('dashboard'))}>
                            Back to dashboard
                        </Button>
                        <form onSubmit={onSubmit}>
                            <Button type="submit" size="lg" disabled={paying || !scriptReady || !razorpay_key} className="w-full sm:w-auto">
                                {paying ? 'Opening checkout…' : `Pay ${currencyLabel}${yearly_package.amount_formatted}`}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
