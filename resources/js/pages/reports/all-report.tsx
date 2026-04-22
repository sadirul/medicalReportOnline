import AppLayout from '@/layouts/app-layout';
import { formatDateTimeInKolkata } from '@/lib/date-time';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';
import { Printer, ReceiptText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All report',
        href: '/reports/all-report',
    },
];

type ReportRow = {
    id: number;
    uuid?: string | null;
    memo_number?: string | null;
    incomplete_results_count?: number;
    publication_status?: 'unpublished' | 'released' | string;
    patient_whatsapp_number?: string | null;
    billing_date: string;
    collection_date: string;
    report_date: string;
    department?: string | null;
    patient_name: string;
};

export default function AllReport({
    reports,
    filters,
}: {
    reports: ReportRow[];
    filters: { patient_name: string; patient_address: string; from_date: string; to_date: string; status: string };
}) {
    const filterForm = useForm({
        patient_name: filters.patient_name || '',
        patient_address: filters.patient_address || '',
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        status: filters.status || '',
    });

    const applyFilters: FormEventHandler = (event) => {
        event.preventDefault();
        filterForm.get(route('reports.index', filterForm.data), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All report" />
            <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Report list</h2>
                    <Button asChild>
                        <Link href={route('reports.create')}>Create report</Link>
                    </Button>
                </div>
                <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-14">
                    <div className="grid gap-1 md:col-span-3">
                        <label htmlFor="patient_name_filter" className="text-xs font-medium text-slate-600">
                            Patient name
                        </label>
                        <input
                            id="patient_name_filter"
                            value={filterForm.data.patient_name}
                            onChange={(event) => filterForm.setData('patient_name', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                            placeholder="Search by name"
                        />
                    </div>
                    <div className="grid gap-1 md:col-span-3">
                        <label htmlFor="patient_address_filter" className="text-xs font-medium text-slate-600">
                            Patient address
                        </label>
                        <input
                            id="patient_address_filter"
                            value={filterForm.data.patient_address}
                            onChange={(event) => filterForm.setData('patient_address', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                            placeholder="Search by address"
                        />
                    </div>
                    <div className="grid gap-1 md:col-span-2">
                        <label htmlFor="from_date_filter" className="text-xs font-medium text-slate-600">
                            From date
                        </label>
                        <input
                            id="from_date_filter"
                            type="date"
                            value={filterForm.data.from_date}
                            onChange={(event) => filterForm.setData('from_date', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                        />
                    </div>
                    <div className="grid gap-1 md:col-span-2">
                        <label htmlFor="to_date_filter" className="text-xs font-medium text-slate-600">
                            To date
                        </label>
                        <input
                            id="to_date_filter"
                            type="date"
                            value={filterForm.data.to_date}
                            onChange={(event) => filterForm.setData('to_date', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                        />
                    </div>
                    <div className="grid gap-1 md:col-span-2">
                        <label htmlFor="status_filter" className="text-xs font-medium text-slate-600">
                            Status
                        </label>
                        <select
                            id="status_filter"
                            value={filterForm.data.status}
                            onChange={(event) => filterForm.setData('status', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                        >
                            <option value="">All status</option>
                            <option value="released">Released</option>
                            <option value="unpublished">Unreleased</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2 md:col-span-2 md:justify-start">
                        <Button type="submit" variant="outline">
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                filterForm.setData({
                                    patient_name: '',
                                    patient_address: '',
                                    from_date: '',
                                    to_date: '',
                                    status: '',
                                });
                                filterForm.get(route('reports.index'), {
                                    preserveScroll: true,
                                    preserveState: true,
                                    replace: true,
                                });
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="py-2">Patient</th>
                                <th className="py-2">Memo Number</th>
                                <th className="py-2">Billing Date</th>
                                <th className="py-2">Report Date</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-5 text-center text-slate-500">
                                        No reports created yet.
                                    </td>
                                </tr>
                            )}
                            {reports.map((report) => (
                                <tr key={report.id} className="border-t">
                                    <td className="py-2">{report.patient_name}</td>
                                    <td className="py-2">{report.memo_number ?? '-'}</td>
                                    <td className="py-2">{formatDateTimeInKolkata(report.billing_date)}</td>
                                    <td className="py-2">{formatDateTimeInKolkata(report.report_date)}</td>
                                    <td className="py-2">
                                        {report.publication_status === 'released' ? (
                                            <span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Released</span>
                                        ) : (
                                            <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">Unreleased</span>
                                        )}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex gap-2">
                                            {report.publication_status !== 'released' &&
                                                ((report.incomplete_results_count ?? 0) === 0 ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                                        asChild
                                                    >
                                                        <Link href={route('reports.release', report.id)} method="post" as="button">
                                                            Release
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled
                                                        title="Please put all result value to release"
                                                        className="cursor-not-allowed bg-slate-400 text-white hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-600"
                                                    >
                                                        Release
                                                    </Button>
                                                ))}
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('reports.edit', report.id)}>Edit</Link>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('reports.show', report.id)}>View</Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <a
                                                    href={report.uuid ? route('reports.pdf', { report: report.uuid }) : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Print report PDF"
                                                    title="Print report PDF"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <a
                                                    href={
                                                        report.uuid
                                                            ? route('reports.public.bill', { report: report.uuid })
                                                            : route('reports.bill', report.id)
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Print invoice"
                                                    title="Print invoice"
                                                >
                                                    <ReceiptText className="mr-1 h-4 w-4" />
                                                    Invoice
                                                </a>
                                            </Button>
                                            {report.publication_status === 'released' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-[#25D366] text-white hover:bg-[#1fbe5a] dark:bg-[#25D366] dark:text-white dark:hover:bg-[#1fbe5a]"
                                                    asChild
                                                >
                                                    <Link href={route('reports.send-whatsapp', report.id)} method="post" as="button">
                                                        <span className="mr-1">Send to</span>
                                                        <svg
                                                            viewBox="0 0 32 32"
                                                            className="h-4 w-4 fill-current"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M19.11 17.21c-.27-.14-1.58-.78-1.82-.87-.24-.09-.41-.14-.58.14-.17.27-.67.87-.82 1.05-.15.18-.3.2-.57.07-.27-.14-1.12-.41-2.14-1.31-.79-.7-1.32-1.57-1.48-1.84-.15-.27-.02-.41.11-.54.12-.12.27-.3.41-.45.14-.15.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.58-1.41-.8-1.93-.21-.5-.43-.43-.58-.44h-.49c-.17 0-.45.07-.68.34-.24.27-.9.88-.9 2.14s.92 2.48 1.05 2.65c.14.18 1.81 2.76 4.38 3.87.61.26 1.09.41 1.46.52.62.2 1.18.17 1.63.1.5-.07 1.58-.65 1.8-1.28.22-.63.22-1.17.15-1.28-.06-.1-.24-.17-.51-.31z" />
                                                            <path d="M16 .47C7.42.47.47 7.42.47 16c0 2.82.76 5.57 2.2 7.98L.3 31.7l7.9-2.33A15.43 15.43 0 0 0 16 31.53c8.58 0 15.53-6.95 15.53-15.53C31.53 7.42 24.58.47 16 .47zm0 28.44c-2.47 0-4.88-.66-6.98-1.92l-.5-.3-4.69 1.38 1.39-4.57-.32-.53A12.82 12.82 0 0 1 3.08 16C3.08 8.87 8.87 3.08 16 3.08S28.92 8.87 28.92 16 23.13 28.91 16 28.91z" />
                                                        </svg>
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
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
