import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, FileText, Inbox, Send, ShieldAlert, ShieldCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    stats,
    monthlyReports,
    currentYear,
}: {
    stats: {
        departments: number;
        total_reports: number;
        released_reports: number;
        unreleased_reports: number;
        pending_sent_reports: number;
        total_sent_reports: number;
        published_sent_reports: number;
        pending_incoming_reports: number;
        total_incoming_reports: number;
        published_incoming_reports: number;
    };
    monthlyReports: Array<{
        month: string;
        count: number;
    }>;
    currentYear: number;
}) {
    const maxCount = Math.max(...monthlyReports.map((item) => item.count), 1);

    const cards = [
        {
            title: 'Departments',
            value: stats.departments,
            href: '/departments/all-department',
            icon: Building2,
            iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
        },
        {
            title: 'Total Reports',
            value: stats.total_reports,
            href: '/reports/all-report',
            icon: FileText,
            iconClass: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200',
        },
        {
            title: 'Released',
            value: stats.released_reports,
            href: '/reports/all-report?status=released',
            icon: ShieldCheck,
            iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
        },
        {
            title: 'Unreleased',
            value: stats.unreleased_reports,
            href: '/reports/all-report?status=unpublished',
            icon: ShieldAlert,
            iconClass: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
        },
    ];

    const sentReportCards = [
        {
            title: 'Total sent report',
            value: stats.total_sent_reports,
            href: '/clinics/other-clinic/requested-report',
            icon: FileText,
            iconClass: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200',
        },
        {
            title: 'Pending sent report',
            value: stats.pending_sent_reports,
            href: '/clinics/other-clinic/requested-report?status=pending',
            icon: Send,
            iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
        },
        {
            title: 'Published sent report',
            value: stats.published_sent_reports,
            href: '/clinics/other-clinic/requested-report?status=published',
            icon: ShieldCheck,
            iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
        },
    ];

    const incomingReportCards = [
        {
            title: 'Total incoming report',
            value: stats.total_incoming_reports,
            href: '/clinics/other-clinic/client-report',
            icon: Inbox,
            iconClass: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200',
        },
        {
            title: 'Pending incoming report',
            value: stats.pending_incoming_reports,
            href: '/clinics/other-clinic/client-report?status=pending',
            icon: Inbox,
            iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
        },
        {
            title: 'Published incoming report',
            value: stats.published_incoming_reports,
            href: '/clinics/other-clinic/client-report?status=published',
            icon: ShieldCheck,
            iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl bg-slate-50/60 p-4 dark:bg-slate-950/50">
                <h2 className="w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-100">Dashboard Overview</h2>
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-lg p-2 ${card.iconClass}`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</p>
                        </Link>
                    ))}
                </div>

                <h3 className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-100">Other Clinic Sent Report Overview</h3>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {sentReportCards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-lg p-2 ${card.iconClass}`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</p>
                        </Link>
                    ))}
                </div>

                <h3 className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-100">Incoming Report Overview</h3>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {incomingReportCards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-lg p-2 ${card.iconClass}`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</p>
                        </Link>
                    ))}
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Monthly Reports Count</h3>
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                            {currentYear}
                        </span>
                    </div>

                    <div className="grid h-64 grid-cols-12 items-end gap-2">
                        {monthlyReports.map((item) => {
                            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            const barHeight = Math.max(heightPercent, item.count > 0 ? 10 : 3);

                            return (
                                <div key={item.month} className="flex h-full flex-col items-center justify-end">
                                    <span className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">{item.count}</span>
                                    <div
                                        className="w-full rounded-t-md bg-blue-500/85 dark:bg-blue-400/80"
                                        style={{ height: `${barHeight}%` }}
                                        title={`${item.month}: ${item.count} reports`}
                                    />
                                    <span className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">{item.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
