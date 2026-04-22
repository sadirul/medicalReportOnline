import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { authIcons } from '@/lib/icon-map';
import { SharedData } from '@/types';

interface ForgotVerifyOtpForm {
    otp: string;
}

export default function ForgotPasswordVerifyOtp({ mobile }: { mobile: string }) {
    const { flash } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors } = useForm<ForgotVerifyOtpForm>({
        otp: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.reset.otp.verify'));
    };

    const resendOtp: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.reset.otp.resend'));
    };

    return (
        <AuthLayout title="Verify OTP" description={`Enter the OTP sent to ${mobile}`}>
            <Head title="Verify OTP" />

            {flash?.status && <div className="mb-4 text-center text-sm font-medium text-green-600">{flash.status}</div>}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-700">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <authIcons.verifyOtp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Verify your mobile</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Enter the code to set a new password</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="otp">OTP</Label>
                        <Input
                            id="otp"
                            type="text"
                            required
                            autoFocus
                            maxLength={6}
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={processing}
                            placeholder="Enter 6 digit OTP"
                        />
                        <InputError message={errors.otp} />
                    </div>

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Verify OTP
                    </Button>

                    <Button type="button" variant="secondary" className="w-full" disabled={processing} onClick={resendOtp}>
                        Resend OTP
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    <TextLink href={route('password.request')}>Back to forgot password</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
