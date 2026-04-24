import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import * as yup from 'yup';

import InputError from '@/components/input-error';
import { toFieldErrors } from '@/lib/yup-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { authIcons } from '@/lib/icon-map';

interface ResetPasswordProps {
    mobile: string;
}

interface ResetPasswordForm {
    password: string;
    password_confirmation: string;
}

const resetPasswordSchema = yup.object({
    password: yup.string().required('Password is required.').min(8, 'Password must be at least 8 characters.'),
    password_confirmation: yup
        .string()
        .required('Confirm password is required.')
        .oneOf([yup.ref('password')], 'Passwords do not match.'),
});

export default function ResetPassword({ mobile }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        password: '',
        password_confirmation: '',
    });
    const [clientErrors, setClientErrors] = useState<{ password?: string; password_confirmation?: string }>({});

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        try {
            await resetPasswordSchema.validate(data, { abortEarly: false });
            setClientErrors({});
        } catch (error) {
            setClientErrors(toFieldErrors(error));
            return;
        }

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="grid gap-6 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-700">
                        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                            <authIcons.resetPassword className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Create new password</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Account: {mobile}</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoFocus
                            onChange={(e) => {
                                setData('password', e.target.value);
                                setClientErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                            placeholder="Password"
                        />
                        <InputError message={clientErrors.password ?? errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => {
                                setData('password_confirmation', e.target.value);
                                setClientErrors((prev) => ({ ...prev, password_confirmation: undefined }));
                            }}
                            placeholder="Confirm password"
                        />
                        <InputError message={clientErrors.password_confirmation ?? errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
