import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Investigation = {
    id: number;
    department_id: number;
    name: string;
    unit?: string | null;
    bio_ref_interval?: string | null;
    amount?: string | null;
};

type DepartmentDetail = {
    id: number;
    name: string;
    investigations: Investigation[];
};

export default function ShowDepartment({ department }: { department: DepartmentDetail }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'All department', href: '/departments/all-department' },
        { title: department.name, href: `/departments/${department.id}` },
    ];

    const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);

    const departmentForm = useForm({
        name: department.name,
    });

    const investigationForm = useForm({
        department_id: String(department.id),
        name: '',
        unit: '',
        bio_ref_interval: '',
        amount: '',
    });

    const submitDepartment: FormEventHandler = (event) => {
        event.preventDefault();
        departmentForm.patch(route('departments.update', department.id), {
            preserveScroll: true,
        });
    };

    const submitInvestigation: FormEventHandler = (event) => {
        event.preventDefault();

        if (editingInvestigation) {
            investigationForm.patch(route('investigations.update', editingInvestigation.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingInvestigation(null);
                    investigationForm.reset('name', 'unit', 'bio_ref_interval', 'amount');
                },
            });
            return;
        }

        investigationForm.post(route('investigations.store', department.id), {
            preserveScroll: true,
            onSuccess: () => investigationForm.reset('name', 'unit', 'bio_ref_interval', 'amount'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={department.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">{department.name}</h1>
                    <Button variant="outline" asChild>
                        <Link href={route('departments.index')}>Back to all department</Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <form onSubmit={submitDepartment} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                        <h2 className="text-sm font-semibold">Edit department</h2>
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
                        <Button disabled={departmentForm.processing}>Update department</Button>
                    </form>

                    <form onSubmit={submitInvestigation} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                        <h2 className="text-sm font-semibold">{editingInvestigation ? 'Edit test' : 'Add test'}</h2>
                        <div className="grid gap-2">
                            <Label htmlFor="investigation_name">Test name</Label>
                            <Input
                                id="investigation_name"
                                value={investigationForm.data.name}
                                onChange={(event) => investigationForm.setData('name', event.target.value)}
                                required
                            />
                            <InputError message={investigationForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="investigation_unit">Unit</Label>
                            <Input
                                id="investigation_unit"
                                value={investigationForm.data.unit}
                                onChange={(event) => investigationForm.setData('unit', event.target.value)}
                            />
                            <InputError message={investigationForm.errors.unit} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="investigation_ref">Biological reference interval</Label>
                            <Input
                                id="investigation_ref"
                                value={investigationForm.data.bio_ref_interval}
                                onChange={(event) => investigationForm.setData('bio_ref_interval', event.target.value)}
                            />
                            <InputError message={investigationForm.errors.bio_ref_interval} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="investigation_amount">Amount</Label>
                            <Input
                                id="investigation_amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={investigationForm.data.amount}
                                onChange={(event) => investigationForm.setData('amount', event.target.value)}
                            />
                            <InputError message={investigationForm.errors.amount} />
                        </div>
                        <div className="flex gap-2">
                            <Button disabled={investigationForm.processing}>
                                {editingInvestigation ? 'Update test' : 'Save test'}
                            </Button>
                            {editingInvestigation && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingInvestigation(null);
                                        investigationForm.reset('name', 'unit', 'bio_ref_interval', 'amount');
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">Tests</h2>
                    {department.investigations.length === 0 && <p className="text-sm text-slate-500">No tests added yet.</p>}
                    {department.investigations.map((investigation) => (
                        <div key={investigation.id} className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <p className="font-medium">{investigation.name}</p>
                                <p className="text-xs text-slate-500">
                                    Unit: {investigation.unit ?? '-'} | Ref: {investigation.bio_ref_interval ?? '-'} | Amount:{' '}
                                    {investigation.amount ?? '-'}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setEditingInvestigation(investigation);
                                    investigationForm.setData({
                                        department_id: String(department.id),
                                        name: investigation.name,
                                        unit: investigation.unit ?? '',
                                        bio_ref_interval: investigation.bio_ref_interval ?? '',
                                        amount: investigation.amount ?? '',
                                    });
                                }}
                            >
                                Edit
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
