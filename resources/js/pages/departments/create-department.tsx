import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type DepartmentLite = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create department',
        href: '/departments/create-department',
    },
];

export default function CreateDepartment({ departments }: { departments: DepartmentLite[] }) {
    const form = useForm({
        name: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post(route('departments.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create department" />
            <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">Create department</h2>
                    <div className="grid gap-2">
                        <Label htmlFor="department_name">Department name</Label>
                        <Input
                            id="department_name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <Button disabled={form.processing}>Save department</Button>
                </form>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Quick list</h2>
                        <Button variant="outline" asChild>
                            <Link href={route('departments.index')}>All department</Link>
                        </Button>
                    </div>
                    {departments.length === 0 && <p className="text-sm text-slate-500">No department added yet.</p>}
                    {departments.map((department) => (
                        <div key={department.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                            <span className="font-medium">{department.name}</span>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={route('departments.show', department.id)}>View</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
