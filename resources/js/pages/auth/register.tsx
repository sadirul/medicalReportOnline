import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, LoaderCircle, LockKeyhole, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';

interface RegisterForm {
    full_name: string;
    clinic_name: string;
    mobile: string;
    email: string;
    password: string;
    password_confirmation: string;
    address: string;
    [key: string]: string;
}

export default function Register() {
    const { flash } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        full_name: '',
        clinic_name: '',
        mobile: '',
        email: '',
        password: '',
        password_confirmation: '',
        address: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register.otp.send'), {
            preserveScroll: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
            <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
                <aside className="relative hidden overflow-hidden lg:block">
                    <img src="/assets/images/landing-page/microscope.png" alt="Diagnostics lab microscope" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-900/45 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-10 text-white">
                        <p className="text-sm font-medium tracking-wide text-blue-200">Medical Diagnocare Software</p>
                        <h1 className="mt-2 text-4xl font-bold leading-tight">Create your clinic account in minutes.</h1>
                        <p className="mt-3 max-w-md text-sm text-slate-200">Enter your clinic details and continue with OTP verification to activate access.</p>
                    </div>
                </aside>

                <main className="flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-xl space-y-6">
                        <div className="flex justify-center lg:hidden">
                            <img src="/assets/images/icon.png" alt="App icon" className="h-auto w-32 object-contain" />
                        </div>

                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900">Create your clinic account</h2>
                            <p className="text-sm text-slate-600">Enter your details and verify mobile OTP to continue.</p>
                        </div>

                        <form className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60" onSubmit={submit}>
                            {flash?.status && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                                    {flash.status}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="full_name">Full name</Label>
                                    <div className="relative">
                                        <UserRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="full_name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Full name"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.full_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="clinic_name">Clinic name</Label>
                                    <div className="relative">
                                        <Building2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="clinic_name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            value={data.clinic_name}
                                            onChange={(e) => setData('clinic_name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Clinic name"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.clinic_name} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="mobile">Mobile number</Label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="mobile"
                                            type="tel"
                                            required
                                            tabIndex={3}
                                            maxLength={10}
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            disabled={processing}
                                            placeholder="10 digit mobile number"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.mobile} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={4}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="email@example.com"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="address"
                                        type="text"
                                        required
                                        tabIndex={5}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        disabled={processing}
                                        placeholder="Clinic address"
                                        className="h-11 pl-10"
                                    />
                                </div>
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={6}
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            disabled={processing}
                                            placeholder="Password"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <div className="relative">
                                        <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            tabIndex={7}
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            disabled={processing}
                                            placeholder="Confirm password"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full bg-linear-to-r from-blue-600 to-violet-600 text-sm font-semibold shadow-md transition hover:brightness-110"
                                tabIndex={8}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </form>

                        <div className="text-muted-foreground text-center text-sm lg:text-left">
                            Already have an account?{' '}
                            <TextLink href={route('login')} tabIndex={9}>
                                Log in
                            </TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
