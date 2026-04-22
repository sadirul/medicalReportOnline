import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDateTimeInKolkata } from '@/lib/date-time';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type ClientReportRow = {
    id: number;
    uuid: string;
    status: 'sent' | 'received' | 'published' | string;
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
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('clinics.client.edit', report.id)}>Edit</Link>
                                            </Button>
                                            {report.status === 'published' && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={route('clinics.shared.pdf', report.uuid)} target="_blank" rel="noreferrer">
                                                        PDF
                                                    </a>
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
