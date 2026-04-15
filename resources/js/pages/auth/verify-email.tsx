// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { authIcons } from '@/lib/icon-map';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <authIcons.verifyEmail className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email verification pending</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Open your email and click the verification link</p>
                    </div>
                </div>

                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
