import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import * as yup from 'yup';

import InputError from '@/components/input-error';
import { toFieldErrors } from '@/lib/yup-validation';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';

interface ForgotVerifyOtpForm {
    otp: string;
    [key: string]: string;
}

const forgotVerifyOtpSchema = yup.object({
    otp: yup.string().required('OTP is required.').matches(/^\d{6}$/, 'Please enter a valid 6 digit OTP.'),
});

export default function ForgotPasswordVerifyOtp({ mobile }: { mobile: string }) {
    const { flash } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors } = useForm<ForgotVerifyOtpForm>({
        otp: '',
    });
    const [clientError, setClientError] = useState<string | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        try {
            await forgotVerifyOtpSchema.validate(data, { abortEarly: false });
            setClientError(null);
        } catch (error) {
            const parsedErrors = toFieldErrors(error);
            setClientError(parsedErrors.otp ?? 'Please check your OTP.');
            return;
        }

        post(route('password.reset.otp.verify'));
    };

    const resendOtp: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.reset.otp.resend'));
    };

    return (
        <>
            <Head title="Verify OTP" />
            <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
                <aside className="relative hidden overflow-hidden lg:block">
                    <img src="/assets/images/landing-page/microscope.png" alt="Diagnostics lab microscope" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-900/45 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-10 text-white">
                        <p className="text-sm font-medium tracking-wide text-blue-200">Password recovery</p>
                        <h1 className="mt-2 text-4xl font-bold leading-tight">Verify OTP to set a new password.</h1>
                    </div>
                </aside>

                <main className="flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-md space-y-6">
                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900">Verify OTP</h2>
                            <p className="text-sm text-slate-600">Enter the OTP sent to {mobile}.</p>
                        </div>

                        <form className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60" onSubmit={submit}>
                            {flash?.status && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                                    {flash.status}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="otp">OTP</Label>
                                <div className="relative">
                                    <ShieldCheck className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="otp"
                                        type="text"
                                        required
                                        autoFocus
                                        maxLength={6}
                                        value={data.otp}
                                        onChange={(e) => {
                                            setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6));
                                            setClientError(null);
                                        }}
                                        disabled={processing}
                                        placeholder="Enter 6 digit OTP"
                                        className="h-11 pl-10"
                                    />
                                </div>
                                <InputError message={clientError ?? errors.otp} />
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full bg-linear-to-r from-blue-600 to-violet-600 text-sm font-semibold shadow-md transition hover:brightness-110"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Verify OTP
                            </Button>

                            <Button type="button" variant="secondary" className="h-11 w-full" disabled={processing} onClick={resendOtp}>
                                Resend OTP
                            </Button>
                        </form>

                        <div className="text-muted-foreground text-center text-sm lg:text-left">
                            <TextLink href={route('password.request')}>Back to forgot password</TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
