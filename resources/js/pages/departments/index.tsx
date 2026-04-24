import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Investigation = {
    id: number;
    department_id: number;
    name: string;
    unit?: string | null;
    bio_ref_interval?: string | null;
};

type Department = {
    id: number;
    name: string;
    investigations: Investigation[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: '/departments',
    },
];

export default function Departments({ departments }: { departments: Department[] }) {
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);

    const departmentForm = useForm({ name: '' });
    const investigationForm = useForm({
        department_id: '',
        name: '',
        unit: '',
        bio_ref_interval: '',
    });

    const submitDepartment: FormEventHandler = (event) => {
        event.preventDefault();
        if (editingDepartment) {
            departmentForm.patch(route('departments.update', editingDepartment.id), { preserveScroll: true });
            return;
        }
        departmentForm.post(route('departments.store'), {
            preserveScroll: true,
            onSuccess: () => departmentForm.reset(),
        });
    };

    const submitInvestigation: FormEventHandler = (event) => {
        event.preventDefault();
        if (editingInvestigation) {
            investigationForm.patch(route('investigations.update', editingInvestigation.id), { preserveScroll: true });
            return;
        }

        investigationForm.post(route('investigations.store', investigationForm.data.department_id), {
            preserveScroll: true,
            onSuccess: () => investigationForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <form onSubmit={submitDepartment} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                        <h2 className="text-sm font-semibold">{editingDepartment ? 'Edit department' : 'Add department'}</h2>
                        <div className="grid gap-2">
                            <Label htmlFor="department_name">Department name</Label>
                            <Input
                                id="department_name"
                                value={departmentForm.data.name}
                                onChange={(event) => departmentForm.setData('name', event.target.value)}
                                required
                            />
                            <InputError message={departmentForm.errors.name} />
                        </div>
                        <div className="flex gap-2">
                            <Button disabled={departmentForm.processing}>
                                {editingDepartment ? 'Update department' : 'Save department'}
                            </Button>
                            {editingDepartment && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingDepartment(null);
                                        departmentForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>

                    <form onSubmit={submitInvestigation} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                        <h2 className="text-sm font-semibold">{editingInvestigation ? 'Edit investigation' : 'Add investigation'}</h2>
                        <div className="grid gap-2">
                            <Label htmlFor="investigation_department_id">Department</Label>
                            <select
                                id="investigation_department_id"
                                className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                                value={investigationForm.data.department_id}
                                onChange={(event) => investigationForm.setData('department_id', event.target.value)}
                                required
                            >
                                <option value="">Select department</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={investigationForm.errors.department_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="investigation_name">Investigation name</Label>
                            <Input
                                id="investigation_name"
                                value={investigationForm.data.name}
                                onChange={(event) => investigationForm.setData('name', event.target.value)}
                                required
                            />
                            <InputError message={investigationForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input id="unit" value={investigationForm.data.unit} onChange={(event) => investigationForm.setData('unit', event.target.value)} />
                            <InputError message={investigationForm.errors.unit} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bio_ref_interval">BIO. REF. INTERVAL</Label>
                            <Input
                                id="bio_ref_interval"
                                value={investigationForm.data.bio_ref_interval}
                                onChange={(event) => investigationForm.setData('bio_ref_interval', event.target.value)}
                            />
                            <InputError message={investigationForm.errors.bio_ref_interval} />
                        </div>
                        <div className="flex gap-2">
                            <Button disabled={investigationForm.processing}>
                                {editingInvestigation ? 'Update investigation' : 'Save investigation'}
                            </Button>
                            {editingInvestigation && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingInvestigation(null);
                                        investigationForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">Departments and investigations</h2>
                    {departments.length === 0 && <p className="text-sm text-slate-500">No department added yet.</p>}
                    {departments.map((department) => (
                        <div key={department.id} className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-medium">{department.name}</h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingDepartment(department);
                                        departmentForm.setData('name', department.name);
                                    }}
                                >
                                    Edit department
                                </Button>
                            </div>
                            <div className="space-y-2 text-sm">
                                {department.investigations.length === 0 && <p className="text-slate-500">No investigations.</p>}
                                {department.investigations.map((investigation) => (
                                    <div key={investigation.id} className="flex items-center justify-between border-t pt-2">
                                        <div>
                                            <p className="font-medium">{investigation.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Unit: {investigation.unit ?? '-'} | Ref: {investigation.bio_ref_interval ?? '-'}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingInvestigation(investigation);
                                                investigationForm.setData({
                                                    department_id: String(investigation.department_id),
                                                    name: investigation.name,
                                                    unit: investigation.unit ?? '',
                                                    bio_ref_interval: investigation.bio_ref_interval ?? '',
                                                });
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
