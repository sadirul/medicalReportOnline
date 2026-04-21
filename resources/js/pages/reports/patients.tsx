import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

type Patient = {
    id: number;
    name: string;
    v_id: string;
    age: number;
    sex: string;
    address?: string | null;
    referred_by?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patients',
        href: '/patients',
    },
];

const emptyPatient = {
    name: '',
    v_id: '',
    age: '',
    sex: 'Female',
    address: '',
    referred_by: '',
};

export default function Patients({ patients }: { patients: Patient[] }) {
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    const formInitialState = useMemo(() => {
        if (!editingPatient) {
            return emptyPatient;
        }

        return {
            name: editingPatient.name,
            v_id: editingPatient.v_id,
            age: String(editingPatient.age),
            sex: editingPatient.sex,
            address: editingPatient.address ?? '',
            referred_by: editingPatient.referred_by ?? '',
        };
    }, [editingPatient]);

    const { data, setData, post, patch, processing, errors, reset } = useForm(formInitialState);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editingPatient) {
            patch(route('patients.update', editingPatient.id), {
                preserveScroll: true,
            });

            return;
        }

        post(route('patients.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const startEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setData({
            name: patient.name,
            v_id: patient.v_id,
            age: String(patient.age),
            sex: patient.sex,
            address: patient.address ?? '',
            referred_by: patient.referred_by ?? '',
        });
    };

    const cancelEdit = () => {
        setEditingPatient(null);
        setData(emptyPatient);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients" />
            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">{editingPatient ? 'Edit patient' : 'Add patient'}</h2>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Patient name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="v_id">V.Id</Label>
                        <Input id="v_id" value={data.v_id} onChange={(e) => setData('v_id', e.target.value)} required />
                        <InputError message={errors.v_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" type="number" min={0} value={data.age} onChange={(e) => setData('age', e.target.value)} required />
                            <InputError message={errors.age} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sex">Sex</Label>
                            <Input id="sex" value={data.sex} onChange={(e) => setData('sex', e.target.value)} required />
                            <InputError message={errors.sex} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="referred_by">Referred by</Label>
                        <Input id="referred_by" value={data.referred_by} onChange={(e) => setData('referred_by', e.target.value)} />
                        <InputError message={errors.referred_by} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {editingPatient ? 'Update patient' : 'Save patient'}
                        </Button>
                        {editingPatient && (
                            <Button type="button" variant="outline" onClick={cancelEdit}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm lg:col-span-2 dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">Patients list</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    <th className="py-2">Patient Name</th>
                                    <th className="py-2">V.Id</th>
                                    <th className="py-2">Age/Sex</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-5 text-center text-slate-500">
                                            No patients found.
                                        </td>
                                    </tr>
                                )}
                                {patients.map((patient) => (
                                    <tr key={patient.id} className="border-t">
                                        <td className="py-2">{patient.name}</td>
                                        <td className="py-2">{patient.v_id}</td>
                                        <td className="py-2">
                                            {patient.age} Y / {patient.sex}
                                        </td>
                                        <td className="py-2">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" type="button" onClick={() => startEdit(patient)}>
                                                    Edit
                                                </Button>
                                                <Button size="sm" asChild>
                                                    <Link href={route('reports.create', { patient: patient.id })}>Create report</Link>
                                                </Button>
                                            </div>
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
