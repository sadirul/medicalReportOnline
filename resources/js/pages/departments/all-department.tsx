import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type DepartmentRow = {
    id: number;
    name: string;
    investigations_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All department',
        href: '/departments/all-department',
    },
];

export default function AllDepartment({ departments }: { departments: DepartmentRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All department" />
            <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Department list</h2>
                    <Button asChild>
                        <Link href={route('departments.create')}>Create department</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="py-2">Department name</th>
                                <th className="py-2">Investigations</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-5 text-center text-slate-500">
                                        No department added yet.
                                    </td>
                                </tr>
                            )}
                            {departments.map((department) => (
                                <tr key={department.id} className="border-t">
                                    <td className="py-2">{department.name}</td>
                                    <td className="py-2">{department.investigations_count}</td>
                                    <td className="py-2">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={route('departments.show', department.id)}>View</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
