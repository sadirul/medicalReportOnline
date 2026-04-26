import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface LoginForm {
    login_id: string;
    password: string;
    remember: boolean;
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function SuperadminLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        login_id: '',
        password: '',
        remember: false,
    });
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

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('superadmin.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            window.alert('Install option is available in browser menu: choose "Install app" or "Add to Home Screen".');
            return;
        }

        setIsInstalling(true);
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsInstalling(false);
    };

    return (
        <>
            <Head title="Superadmin Login" />

            <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
                <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-600">Restricted Access</p>
                        <h1 className="text-2xl font-bold text-slate-900">Superadmin login</h1>
                        <p className="text-sm text-slate-600">Sign in to manage all clinics and balances.</p>
                    </div>

                    {status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{status}</div>}

                    {!isStandalone && (
                        <Button type="button" variant="outline" onClick={handleInstallClick} disabled={isInstalling} className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                            {isInstalling ? 'Installing...' : 'Install App'}
                        </Button>
                    )}

                    <form className="space-y-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="login_id">Login ID</Label>
                            <Input
                                id="login_id"
                                value={data.login_id}
                                onChange={(event) => setData('login_id', event.target.value)}
                                placeholder="Enter login ID"
                                autoFocus
                                required
                            />
                            <InputError message={errors.login_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder="Enter password"
                                required
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked === true)}
                            />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>

                        <Button className="w-full" disabled={processing}>
                            Login
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
