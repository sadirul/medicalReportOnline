import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDateTimeInKolkata } from '@/lib/date-time';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, ReceiptText } from 'lucide-react';

type ClientReportRow = {
    id: number;
    uuid: string;
    status: 'sent' | 'received' | 'published' | string;
    incomplete_results_count?: number;
    patient_name: string;
    sent_at?: string | null;
    sender?: {
        clinic_name: string;
        full_name: string;
    } | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Client report',
        href: '/clinics/other-clinic/client-report',
    },
];

const statusStyle: Record<string, string> = {
    sent: 'bg-amber-100 text-amber-700',
    received: 'bg-blue-100 text-blue-700',
    published: 'bg-emerald-100 text-emerald-700',
};

const formatStatus = (status: string) => (status ? status.charAt(0).toUpperCase() + status.slice(1) : status);

export default function ClientReport({ reports }: { reports: ClientReportRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client report" />

            <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <h2 className="text-sm font-semibold">Client report list</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="py-2">Sender clinic</th>
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
                                        No client reports yet.
                                    </td>
                                </tr>
                            )}
                            {reports.map((report) => (
                                <tr key={report.id} className="border-t">
                                    <td className="py-2">{report.sender?.clinic_name ?? '-'}</td>
                                    <td className="py-2">{report.patient_name}</td>
                                    <td className="py-2">{report.sent_at ? formatDateTimeInKolkata(report.sent_at) : '-'}</td>
                                    <td className="py-2">
                                        <span className={`rounded px-2 py-1 text-xs ${statusStyle[report.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {formatStatus(report.status)}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            {report.status !== 'published' &&
                                                ((report.incomplete_results_count ?? 0) === 0 ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                                        asChild
                                                    >
                                                        <Link href={route('clinics.client.publish', report.id)} method="post" as="button">
                                                            Publish
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled
                                                        title="Please put all result value to publish"
                                                        className="cursor-not-allowed bg-slate-400 text-white hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-600"
                                                    >
                                                        Publish
                                                    </Button>
                                                ))}
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('clinics.client.edit', report.id)}>Edit</Link>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('clinics.client.show', report.id)}>View</Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <a
                                                    href={report.status === 'published' ? route('clinics.shared.pdf', report.uuid) : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Print report PDF"
                                                    title={report.status === 'published' ? 'Print report PDF' : 'Publish report first'}
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <a
                                                    href={report.status === 'published' ? route('clinics.shared.bill', report.uuid) : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Print invoice"
                                                    title={report.status === 'published' ? 'Print invoice' : 'Publish report first'}
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
