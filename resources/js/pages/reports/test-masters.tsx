import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type TestMaster = {
    id: number;
    department: string;
    test_name: string;
    method?: string | null;
    unit?: string | null;
    bio_ref_interval?: string | null;
    display_order: number;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Test master',
        href: '/test-masters',
    },
];

const emptyRow = {
    department: '',
    test_name: '',
    method: '',
    unit: '',
    bio_ref_interval: '',
    display_order: '0',
    is_active: true,
};

export default function TestMasters({ testMasters }: { testMasters: TestMaster[] }) {
    const [editing, setEditing] = useState<TestMaster | null>(null);
    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyRow);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editing) {
            patch(route('test-masters.update', editing.id), { preserveScroll: true });
            return;
        }

        post(route('test-masters.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const editRow = (item: TestMaster) => {
        setEditing(item);
        setData({
            department: item.department,
            test_name: item.test_name,
            method: item.method ?? '',
            unit: item.unit ?? '',
            bio_ref_interval: item.bio_ref_interval ?? '',
            display_order: String(item.display_order),
            is_active: item.is_active,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test master" />
            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">{editing ? 'Edit test' : 'Add test'}</h2>
                    <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" value={data.department} onChange={(e) => setData('department', e.target.value)} required />
                        <InputError message={errors.department} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="test_name">Test parameter</Label>
                        <Input id="test_name" value={data.test_name} onChange={(e) => setData('test_name', e.target.value)} required />
                        <InputError message={errors.test_name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="method">Method</Label>
                        <Input id="method" value={data.method} onChange={(e) => setData('method', e.target.value)} />
                        <InputError message={errors.method} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input id="unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            <InputError message={errors.unit} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="display_order">Order</Label>
                            <Input id="display_order" type="number" value={data.display_order} onChange={(e) => setData('display_order', e.target.value)} />
                            <InputError message={errors.display_order} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio_ref_interval">Bio. ref. interval</Label>
                        <Input id="bio_ref_interval" value={data.bio_ref_interval} onChange={(e) => setData('bio_ref_interval', e.target.value)} />
                        <InputError message={errors.bio_ref_interval} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                        Active
                    </label>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {editing ? 'Update test' : 'Save test'}
                        </Button>
                        {editing && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditing(null);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm lg:col-span-2 dark:bg-slate-900">
                    <h2 className="text-sm font-semibold">Test master list</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    <th className="py-2">Department</th>
                                    <th className="py-2">Test</th>
                                    <th className="py-2">Unit</th>
                                    <th className="py-2">Reference</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testMasters.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-5 text-center text-slate-500">
                                            No test masters found.
                                        </td>
                                    </tr>
                                )}
                                {testMasters.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="py-2">{item.department}</td>
                                        <td className="py-2">{item.test_name}</td>
                                        <td className="py-2">{item.unit ?? '-'}</td>
                                        <td className="py-2">{item.bio_ref_interval ?? '-'}</td>
                                        <td className="py-2">
                                            <Button type="button" size="sm" variant="outline" onClick={() => editRow(item)}>
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
