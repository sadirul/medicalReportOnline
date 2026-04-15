import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, FileText, UserRoundCheck, Wallet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const cards = [
        {
            title: 'Patient Reports',
            description: 'Recent diagnostic reports',
            icon: FileText,
        },
        {
            title: 'Active Doctors',
            description: 'Verified clinicians online',
            icon: UserRoundCheck,
        },
        {
            title: 'Payments',
            description: 'Collected and pending fees',
            icon: Wallet,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl bg-slate-50/60 p-4 dark:bg-slate-950/50">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900"
                        >
                            <div className="relative z-10 flex items-center gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{card.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
                                </div>
                            </div>
                            <PlaceholderPattern className="absolute inset-0 top-[56px] size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    ))}
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border bg-white shadow-sm md:min-h-min dark:bg-slate-900">
                    <div className="relative z-10 flex items-center gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Activity Overview</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Trends and updates from your clinic workflow</p>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 top-[56px] size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
