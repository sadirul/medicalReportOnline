import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create report',
        href: '/reports/create-report',
    },
];

export default function CreateReport() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create report" />
            <div className="flex h-full min-h-[60vh] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                Create report page (coming soon)
            </div>
        </AppLayout>
    );
}
