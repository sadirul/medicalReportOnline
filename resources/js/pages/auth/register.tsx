import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { SharedData } from '@/types';

interface RegisterForm {
    full_name: string;
    clinic_name: string;
    mobile: string;
    email: string;
    password: string;
    password_confirmation: string;
    address: string;
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
        <AuthLayout title="Create your clinic account" description="Enter your details and verify mobile OTP to continue">
            <Head title="Register" />

            {flash?.status && <div className="mb-4 text-center text-sm font-medium text-green-600">{flash.status}</div>}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Full name</Label>
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
                        />
                        <InputError message={errors.full_name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="clinic_name">Clinic name</Label>
                        <Input
                            id="clinic_name"
                            type="text"
                            required
                            tabIndex={2}
                            value={data.clinic_name}
                            onChange={(e) => setData('clinic_name', e.target.value)}
                            disabled={processing}
                            placeholder="Clinic name"
                        />
                        <InputError message={errors.clinic_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mobile">Mobile number</Label>
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
                        />
                        <InputError message={errors.mobile} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
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
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            type="text"
                            required
                            tabIndex={5}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            disabled={processing}
                            placeholder="Clinic address"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
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
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
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
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={8} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Send OTP
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={9}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
