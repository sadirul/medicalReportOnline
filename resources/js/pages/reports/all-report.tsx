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
                                            {report.publication_status === 'released' && !!report.patient_whatsapp_number && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={route('reports.send-whatsapp', report.id)} method="post" as="button">
                                                        Send to WhatsApp
                                                    </Link>
                                                </Button>
                                            )}
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
