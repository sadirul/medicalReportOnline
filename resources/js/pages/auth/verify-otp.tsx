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

interface VerifyOtpForm {
    otp: string;
}

export default function VerifyOtp({ mobile }: { mobile: string }) {
    const { flash } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors } = useForm<VerifyOtpForm>({
        otp: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register.otp.verify'));
    };

    const resendOtp: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register.otp.resend'));
    };

    return (
        <AuthLayout title="Verify OTP" description={`Enter the OTP sent to ${mobile}`}>
            <Head title="Verify OTP" />

            {flash?.status && <div className="mb-4 text-center text-sm font-medium text-green-600">{flash.status}</div>}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
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
                    Wrong number?{' '}
                    <TextLink href={route('register')}>
                        Back to sign up
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
