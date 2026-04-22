import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
    const { flash } = usePage<{ flash?: { status?: string } }>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        clinic_unique_id: '',
    });
    const [showClinicId, setShowClinicId] = useState(false);
    const [copied, setCopied] = useState(false);

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

                {flash?.status && <p className="text-sm text-slate-700 dark:text-slate-200">{flash.status}</p>}

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
