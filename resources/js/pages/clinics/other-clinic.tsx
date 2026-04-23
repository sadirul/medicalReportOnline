import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type ConnectedClinic = {
    id: number;
    unique_clinic_id: string;
    clinic_name: string;
    full_name: string;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Other clinic',
        href: '/clinics/other-clinic',
    },
];

export default function OtherClinic({
    connectedClinics,
    myClinicUniqueId,
}: {
    connectedClinics: ConnectedClinic[];
    myClinicUniqueId: string;
}) {
    const { flash } = usePage<{ flash?: { status?: string; status_type?: string } }>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        clinic_unique_id: '',
    });
    const {
        data: createData,
        setData: setCreateData,
        post: createPost,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreateForm,
        clearErrors: clearCreateErrors,
    } = useForm({
        full_name: '',
        clinic_name: '',
        mobile: '',
        email: '',
        address: '',
        password: '',
        password_confirmation: '',
    });
    const [showClinicId, setShowClinicId] = useState(false);
    const [copied, setCopied] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const maskedClinicId = (clinicId: string): string => {
        if (clinicId.length <= 6) {
            return clinicId;
        }

        const firstPart = clinicId.slice(0, 4);
        const lastPart = clinicId.slice(-2);

        return `${firstPart}${'*'.repeat(Math.max(clinicId.length - 6, 1))}${lastPart}`;
    };

    const displayedClinicId = showClinicId ? myClinicUniqueId : maskedClinicId(myClinicUniqueId);

    const handleCopyClinicId = async (): Promise<void> => {
        await navigator.clipboard.writeText(myClinicUniqueId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const closeCreateModal = (): void => {
        setCreateModalOpen(false);
        clearCreateErrors();
        resetCreateForm();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Other clinic" />

            <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Other clinic</p>
                    <div className="flex w-full max-w-md items-center gap-2">
                        <Input
                            value={displayedClinicId}
                            readOnly
                            aria-label="My clinic unique ID"
                            className="font-semibold tracking-wide text-blue-700 dark:text-blue-300"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => setShowClinicId((previous) => !previous)}>
                            {showClinicId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={handleCopyClinicId}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('clinics.other.connect'), {
                            preserveScroll: true,
                            errorBag: 'connectClinic',
                            onSuccess: () => reset(),
                        });
                    }}
                    className="grid gap-3 md:grid-cols-[1fr_auto]"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="clinic_unique_id">Connect by clinic ID</Label>
                        <Input
                            id="clinic_unique_id"
                            value={data.clinic_unique_id}
                            onChange={(event) => setData('clinic_unique_id', event.target.value.toUpperCase())}
                            placeholder="MML6TF7YTR45"
                        />
                        <InputError message={errors.clinic_unique_id} />
                    </div>
                    <div className="flex items-end">
                        <Button disabled={processing}>Connect</Button>
                    </div>
                </form>

                <div className="border-t border-slate-200 pt-4 dark:border-slate-700" />

                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700">
                            Create clinic account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create clinic account</DialogTitle>
                            <DialogDescription>Enter clinic details. Account will be created and automatically connected with your clinic.</DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                createPost(route('clinics.other.create-account'), {
                                    preserveScroll: true,
                                    errorBag: 'createClinic',
                                    onSuccess: () => closeCreateModal(),
                                });
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_full_name">Full name</Label>
                                    <Input
                                        id="create_full_name"
                                        value={createData.full_name}
                                        onChange={(event) => setCreateData('full_name', event.target.value)}
                                        placeholder="Full name"
                                    />
                                    <InputError message={createErrors.full_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create_clinic_name">Clinic name</Label>
                                    <Input
                                        id="create_clinic_name"
                                        value={createData.clinic_name}
                                        onChange={(event) => setCreateData('clinic_name', event.target.value)}
                                        placeholder="Clinic name"
                                    />
                                    <InputError message={createErrors.clinic_name} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_mobile">Mobile number</Label>
                                    <Input
                                        id="create_mobile"
                                        value={createData.mobile}
                                        onChange={(event) => setCreateData('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10 digit mobile number"
                                    />
                                    <InputError message={createErrors.mobile} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create_email">Email</Label>
                                    <Input
                                        id="create_email"
                                        type="email"
                                        value={createData.email}
                                        onChange={(event) => setCreateData('email', event.target.value)}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={createErrors.email} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create_address">Address</Label>
                                <Input
                                    id="create_address"
                                    value={createData.address}
                                    onChange={(event) => setCreateData('address', event.target.value)}
                                    placeholder="Clinic address"
                                />
                                <InputError message={createErrors.address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_password">Password</Label>
                                    <Input
                                        id="create_password"
                                        type="password"
                                        value={createData.password}
                                        onChange={(event) => setCreateData('password', event.target.value)}
                                        placeholder="Password"
                                    />
                                    <InputError message={createErrors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create_password_confirmation">Confirm password</Label>
                                    <Input
                                        id="create_password_confirmation"
                                        type="password"
                                        value={createData.password_confirmation}
                                        onChange={(event) => setCreateData('password_confirmation', event.target.value)}
                                        placeholder="Confirm password"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" onClick={closeCreateModal}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={createProcessing}>
                                    Create account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {flash?.status && (
                    <p
                        className={`text-sm ${
                            flash.status_type === 'error'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                    >
                        {flash.status}
                    </p>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="py-2">Clinic name</th>
                                <th className="py-2">Clinic ID</th>
                                <th className="py-2">Contact person</th>
                                <th className="py-2">Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connectedClinics.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-5 text-center text-slate-500">
                                        No connected clinics yet.
                                    </td>
                                </tr>
                            )}
                            {connectedClinics.map((clinic) => (
                                <tr key={clinic.id} className="border-t">
                                    <td className="py-2">{clinic.clinic_name}</td>
                                    <td className="py-2 font-medium">{clinic.unique_clinic_id}</td>
                                    <td className="py-2">{clinic.full_name}</td>
                                    <td className="py-2">{clinic.mobile ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
