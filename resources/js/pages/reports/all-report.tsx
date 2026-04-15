import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All report',
        href: '/reports/all-report',
    },
];

export default function AllReport() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All report" />
            <div className="flex h-full min-h-[60vh] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                All report page (coming soon)
            </div>
        </AppLayout>
    );
}
