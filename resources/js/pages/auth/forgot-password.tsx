import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Phone } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';

export default function ForgotPassword({ status }: { status?: string }) {
    const { errors } = usePage<SharedData>().props;
    const { data, setData, post, processing } = useForm({
        mobile: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.otp.send'));
    };

    return (
        <>
            <Head title="Forgot password" />
            <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
                <aside className="relative hidden overflow-hidden lg:block">
                    <img src="/assets/images/landing-page/microscope.png" alt="Diagnostics lab microscope" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-900/45 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-10 text-white">
                        <p className="text-sm font-medium tracking-wide text-blue-200">Password recovery</p>
                        <h1 className="mt-2 text-4xl font-bold leading-tight">Reset access with mobile OTP.</h1>
                    </div>
                </aside>

                <main className="flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-md space-y-6">
                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900">Forgot password</h2>
                            <p className="text-sm text-slate-600">Enter your registered mobile number to receive an OTP.</p>
                        </div>

                        <form className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60" onSubmit={submit}>
                            {status && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile number</Label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        name="mobile"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        value={data.mobile}
                                        autoFocus
                                        maxLength={10}
                                        onChange={(e) => setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10-digit mobile"
                                        className="h-11 pl-10"
                                    />
                                </div>
                                <InputError message={errors.mobile} />
                            </div>

                            <Button
                                className="h-11 w-full bg-linear-to-r from-blue-600 to-violet-600 text-sm font-semibold shadow-md transition hover:brightness-110"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </form>

                        <div className="text-muted-foreground space-x-1 text-center text-sm lg:text-left">
                            <span>Or, return to</span>
                            <TextLink href={route('login')}>log in</TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
