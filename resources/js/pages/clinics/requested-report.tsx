import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDateTimeInKolkata } from '@/lib/date-time';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, ReceiptText } from 'lucide-react';

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

export default function RequestedReport({ reports }: { reports: RequestedReportRow[] }) {
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
