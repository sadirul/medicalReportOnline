import { Head, useForm } from '@inertiajs/react';
import { Download, LoaderCircle, LockKeyhole, Phone } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import * as yup from 'yup';

import InputError from '@/components/input-error';
import { toFieldErrors } from '@/lib/yup-validation';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    mobile: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const loginSchema = yup.object({
    mobile: yup.string().required('Mobile number is required.').matches(/^\d{10}$/, 'Please enter a valid 10 digit mobile number.'),
    password: yup.string().required('Password is required.'),
});

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        mobile: '',
        password: '',
        remember: false,
    });
    const [clientErrors, setClientErrors] = useState<{ mobile?: string; password?: string }>({});
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
        setIsStandalone(standaloneMode);

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsStandalone(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        try {
            await loginSchema.validate(
                {
                    mobile: data.mobile,
                    password: data.password,
                },
                { abortEarly: false },
            );
            setClientErrors({});
        } catch (error) {
            setClientErrors(toFieldErrors(error));
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            window.alert('The install option is available in your browser menu. Choose "Install app" or "Add to Home Screen".');
            return;
        }

        setIsInstalling(true);
        try {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <>
            <Head title="Log in" />

            <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
                <aside className="relative hidden overflow-hidden lg:block">
                    <img src="/assets/images/landing-page/microscope.png" alt="Diagnostics lab microscope" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-900/45 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-10 text-white">
                        <p className="text-sm font-medium tracking-wide text-blue-200">Medical Diagnocare Software</p>
                        <h1 className="mt-2 text-4xl font-bold leading-tight">Manage diagnostics with clarity and speed.</h1>
                        <p className="mt-3 max-w-md text-sm text-slate-200">
                            Secure records, streamlined workflows, and faster report delivery for your clinic operations.
                        </p>
                    </div>
                </aside>

                <main className="flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-md space-y-6">
                        <div className="flex justify-center lg:hidden">
                            <img src="/assets/images/icon.png" alt="App icon" className="h-auto w-32 object-contain" />
                        </div>

                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900">Log in to your account</h2>
                            <p className="text-sm text-slate-600">Enter your mobile number and password below to continue.</p>
                        </div>

                        <div className="relative pt-4">
                            {!isStandalone && deferredPrompt && (
                                <Button
                                    type="button"
                                    onClick={handleInstallClick}
                                    disabled={isInstalling}
                                    className="absolute -top-3 right-4 h-10 rounded-full border border-slate-200/70 bg-linear-to-r from-slate-900 via-indigo-700 to-blue-600 px-5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:from-slate-800 hover:via-indigo-600 hover:to-blue-500"
                                >
                                    <Download className="mr-1 h-4 w-4" />
                                    {isInstalling ? 'Installing...' : 'Install App'}
                                </Button>
                            )}

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
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="tel"
                                        value={data.mobile}
                                        onChange={(e) => {
                                            setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10));
                                            setClientErrors((prev) => ({ ...prev, mobile: undefined }));
                                        }}
                                        placeholder="10 digit mobile number"
                                        className="h-11 pl-10"
                                    />
                                </div>
                                <InputError message={clientErrors.mobile ?? errors.mobile} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => {
                                            setData('password', e.target.value);
                                            setClientErrors((prev) => ({ ...prev, password: undefined }));
                                        }}
                                        placeholder="Password"
                                        className="h-11 pl-10"
                                    />
                                </div>
                                <InputError message={clientErrors.password ?? errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full bg-linear-to-r from-blue-600 to-violet-600 text-sm font-semibold shadow-md transition hover:brightness-110"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                            </form>
                        </div>

                        <div className="text-muted-foreground text-center text-sm lg:text-left">
                            Don't have an account?{' '}
                            <TextLink href={route('register')} tabIndex={5}>
                                Sign up
                            </TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
