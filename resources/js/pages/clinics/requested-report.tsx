import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDateTimeInKolkata } from '@/lib/date-time';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Printer, ReceiptText } from 'lucide-react';
import { FormEventHandler } from 'react';

type RequestedReportRow = {
    id: number;
    uuid: string;
    status: 'sent' | 'received' | 'published' | string;
    patient_name: string;
    sent_at?: string | null;
    receiver?: {
        clinic_name: string;
        full_name: string;
    } | null;
};

type ConnectedClinicOption = {
    id: number;
    clinic_name: string;
    unique_clinic_id?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requested report',
        href: '/clinics/other-clinic/requested-report',
    },
];

const statusStyle: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
};

const displayStatus = (status: string) => {
    if (status === 'published') {
        return 'Published';
    }

    if (status === 'sent' || status === 'received') {
        return 'Pending';
    }

    return status ? status.charAt(0).toUpperCase() + status.slice(1) : status;
};

const statusKey = (status: string) => (status === 'published' ? 'published' : 'pending');

export default function RequestedReport({
    reports,
    connectedClinics,
    filters,
}: {
    reports: RequestedReportRow[];
    connectedClinics: ConnectedClinicOption[];
    filters: { receiver_user_id: string; patient_name: string; from_date: string; to_date: string; status: string };
}) {
    const filterForm = useForm({
        receiver_user_id: filters.receiver_user_id || '',
        patient_name: filters.patient_name || '',
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        status: filters.status || '',
    });

    const applyFilters: FormEventHandler = (event) => {
        event.preventDefault();
        filterForm.get(route('clinics.requested.index', filterForm.data), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requested report" />

            <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Requested report list</h2>
                    <Button asChild>
                        <Link href={route('clinics.sent.create')}>Sent report</Link>
                    </Button>
                </div>

                <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-12">
                    <div className="grid gap-1 md:col-span-3">
                        <label htmlFor="receiver_user_id_filter" className="text-xs font-medium text-slate-600">
                            Receiver clinic
                        </label>
                        <select
                            id="receiver_user_id_filter"
                            value={filterForm.data.receiver_user_id}
                            onChange={(event) => filterForm.setData('receiver_user_id', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                        >
                            <option value="">All connected clinics</option>
                            {connectedClinics.map((clinic) => (
                                <option key={clinic.id} value={clinic.id}>
                                    {clinic.clinic_name}
                                    {clinic.unique_clinic_id ? ` (${clinic.unique_clinic_id})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1 md:col-span-3">
                        <label htmlFor="patient_name_filter" className="text-xs font-medium text-slate-600">
                            Patient
                        </label>
                        <input
                            id="patient_name_filter"
                            value={filterForm.data.patient_name}
                            onChange={(event) => filterForm.setData('patient_name', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                            placeholder="Search patient"
                        />
                    </div>
                    <div className="grid gap-1 md:col-span-2">
                        <label htmlFor="from_date_filter" className="text-xs font-medium text-slate-600">
                            Sent at (From)
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
                            Sent at (To)
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
                            <option value="pending">Pending</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2 md:col-span-12">
                        <Button type="submit" variant="outline">
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                filterForm.setData({
                                    receiver_user_id: '',
                                    patient_name: '',
                                    from_date: '',
                                    to_date: '',
                                    status: '',
                                });
                                filterForm.get(route('clinics.requested.index'), {
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
                                <th className="py-2">Receiver clinic</th>
                                <th className="py-2">Patient</th>
                                <th className="py-2">Sent at</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-5 text-center text-slate-500">
                                        No sent reports yet.
                                    </td>
                                </tr>
                            )}
                            {reports.map((report) => (
                                <tr key={report.id} className="border-t">
                                    <td className="py-2">{report.receiver?.clinic_name ?? '-'}</td>
                                    <td className="py-2">{report.patient_name}</td>
                                    <td className="py-2">{report.sent_at ? formatDateTimeInKolkata(report.sent_at) : '-'}</td>
                                    <td className="py-2">
                                        <span className={`rounded px-2 py-1 text-xs ${statusStyle[statusKey(report.status)] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {displayStatus(report.status)}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            {report.status === 'published' ? (
                                                <Button size="sm" asChild>
                                                    <a
                                                        href={route('clinics.shared.pdf', report.uuid)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label="Print report PDF"
                                                        title="Print report PDF"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-slate-500"></span>
                                            )}
                                            <Button size="sm" variant="outline" asChild>
                                                <a
                                                    href={route('clinics.shared.bill', report.uuid)}
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
