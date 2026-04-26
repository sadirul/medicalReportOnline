import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const otherSessionsForm = useForm({
        current_password: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const logoutOtherDevices: FormEventHandler = (e) => {
        e.preventDefault();

        otherSessionsForm.post(route('password.logout-other-devices'), {
            preserveScroll: true,
            onSuccess: () => otherSessionsForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />

                    <form onSubmit={updatePassword} className="space-y-6 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-700">
                            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                                <LockKeyhole className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Password security</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Use a strong password to keep your account safe</p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Current password</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder="Current password"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">New password</Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="New password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save password</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>

                    <form onSubmit={logoutOtherDevices} className="space-y-4 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Log out from other devices</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your current password to end sessions on other browsers and devices.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="other_sessions_current_password">Current password</Label>
                            <Input
                                id="other_sessions_current_password"
                                type="password"
                                value={otherSessionsForm.data.current_password}
                                onChange={(e) => otherSessionsForm.setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Current password"
                            />
                            <InputError message={otherSessionsForm.errors.current_password} />
                        </div>

                        <Button type="submit" variant="outline" disabled={otherSessionsForm.processing}>
                            Log out other devices
                        </Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
