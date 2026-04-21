import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, MailCheck, UserRound } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useEffect, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const existingLogo = auth.user.logo
        ? auth.user.logo.startsWith('http')
            ? auth.user.logo
            : `/storage/${auth.user.logo}`
        : null;

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        full_name: auth.user.full_name ?? auth.user.name,
        mobile: auth.user.mobile ?? '',
        email: auth.user.email,
        address: auth.user.address ?? '',
        logo: null as File | null,
        _method: 'patch',
    });

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setData('logo', file);

        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
        }

        setLogoPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your contact and clinic profile details" />

                    <form onSubmit={submit} className="space-y-6 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-700">
                            <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                                <UserRound className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Personal details</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Keep your account profile information up to date</p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Name</Label>

                            <Input
                                id="full_name"
                                className="mt-1 block w-full"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.full_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mobile">Mobile number</Label>

                            <Input
                                id="mobile"
                                type="tel"
                                className="mt-1 block w-full"
                                value={data.mobile}
                                onChange={(e) => setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                required
                                maxLength={10}
                                autoComplete="tel"
                                placeholder="10 digit mobile number"
                            />

                            <InputError className="mt-2" message={errors.mobile} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>

                            <Input
                                id="address"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                                autoComplete="street-address"
                                placeholder="Clinic address"
                            />

                            <InputError className="mt-2" message={errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo">Clinic logo</Label>

                            <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                                <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                    {logoPreview || existingLogo ? (
                                        <img src={logoPreview ?? existingLogo ?? ''} alt="Clinic logo preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-slate-400">
                                            <ImagePlus className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <Input id="logo" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleLogoChange} className="cursor-pointer" />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG, JPG or WEBP up to 2MB.</p>
                                </div>
                            </div>

                            <InputError className="mt-2" message={errors.logo} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-700/50 dark:bg-amber-500/10">
                                <p className="mt-2 flex items-center gap-2 text-sm text-neutral-800 dark:text-amber-100">
                                    <MailCheck className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden dark:text-amber-300 dark:hover:text-amber-200"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

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
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
