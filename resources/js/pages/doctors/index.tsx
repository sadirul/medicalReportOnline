import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Doctor = {
    id: number;
    name: string;
    mobile: string;
    email?: string | null;
    hospital: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Doctors',
        href: '/doctors',
    },
];

const emptyDoctor = {
    name: '',
    mobile: '',
    email: '',
    hospital: '',
};

export default function DoctorsIndex({ doctors }: { doctors: Doctor[] }) {
    const [editing, setEditing] = useState<Doctor | null>(null);
    const form = useForm(emptyDoctor);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editing) {
            form.patch(route('doctors.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditing(null);
                    form.reset();
                },
            });
            return;
        }

        form.post(route('doctors.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const startEdit = (doctor: Doctor) => {
        setEditing(doctor);
        form.setData({
            name: doctor.name,
            mobile: doctor.mobile,
            email: doctor.email ?? '',
            hospital: doctor.hospital,
        });
    };

    const cancelEdit = () => {
        setEditing(null);
        form.clearErrors();
        form.setData(emptyDoctor);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Doctors" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
                <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">{editing ? 'Edit doctor' : 'Add doctor'}</h2>
                    <div className="grid gap-2">
                        <Label htmlFor="doctor_name">Name</Label>
                        <Input id="doctor_name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doctor_mobile">Mobile</Label>
                        <Input
                            id="doctor_mobile"
                            inputMode="numeric"
                            maxLength={10}
                            value={form.data.mobile}
                            onChange={(event) => form.setData('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
                            required
                        />
                        <InputError message={form.errors.mobile} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doctor_email">Email</Label>
                        <Input id="doctor_email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                        <InputError message={form.errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doctor_hospital">Hospital</Label>
                        <Input id="doctor_hospital" value={form.data.hospital} onChange={(event) => form.setData('hospital', event.target.value)} required />
                        <InputError message={form.errors.hospital} />
                    </div>
                    <div className="flex gap-2">
                        <Button disabled={form.processing}>{editing ? 'Update doctor' : 'Save doctor'}</Button>
                        {editing && (
                            <Button type="button" variant="outline" onClick={cancelEdit}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">All doctors</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Mobile</th>
                                    <th className="py-2">Email</th>
                                    <th className="py-2">Hospital</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-5 text-center text-slate-500">
                                            No doctors added yet.
                                        </td>
                                    </tr>
                                )}
                                {doctors.map((doctor) => (
                                    <tr key={doctor.id} className="border-t">
                                        <td className="py-2 font-medium">{doctor.name}</td>
                                        <td className="py-2">{doctor.mobile}</td>
                                        <td className="py-2">{doctor.email || '-'}</td>
                                        <td className="py-2">{doctor.hospital}</td>
                                        <td className="py-2">
                                            <Button type="button" size="sm" variant="outline" onClick={() => startEdit(doctor)}>
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
