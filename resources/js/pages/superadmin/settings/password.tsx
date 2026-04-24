import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function SuperadminPasswordSettings() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.put(route('superadmin.password.update'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <SuperadminLayout title="Settings">
            <Head title="Superadmin Password Settings" />

            <div className="mx-auto w-full max-w-md space-y-3">
                <h2 className="text-left text-base font-semibold text-slate-800 dark:text-slate-100">Change Password</h2>

                <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
                    <div className="grid gap-1.5">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                            id="current_password"
                            type="password"
                            value={form.data.current_password}
                            onChange={(event) => form.setData('current_password', event.target.value)}
                            required
                        />
                        <InputError message={form.errors.current_password} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            required
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                            required
                        />
                        <InputError message={form.errors.password_confirmation} />
                    </div>

                    <Button type="submit" size="sm" disabled={form.processing}>
                        Save Password
                    </Button>
                </form>
            </div>
        </SuperadminLayout>
    );
}
