import { Button } from '@/components/ui/button';
import { formatDateTimeInKolkata } from '@/lib/date-time';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Printer, ReceiptText } from 'lucide-react';

type SharedReportItem = {
    id: number;
    investigation?: {
        id: number;
        name: string;
        department?: {
            id: number;
            name: string;
        } | null;
    } | null;
    parameter_name: string;
    method?: string | null;
    value?: string | null;
    unit?: string | null;
    bio_ref_interval?: string | null;
};

type SharedReport = {
    id: number;
    uuid: string;
    status: 'sent' | 'received' | 'published' | string;
    patient_name: string;
    patient_age: number;
    patient_sex: string;
    patient_address?: string | null;
    patient_referred_by?: string | null;
    billing_date: string;
    collection_date: string;
    report_date: string;
    sender?: {
        clinic_name?: string | null;
    } | null;
    items: SharedReportItem[];
};

export default function ClientReportShow({ report }: { report: SharedReport }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client report', href: '/clinics/other-clinic/client-report' },
        { title: `Report #${report.id}`, href: `/clinics/other-clinic/client-report/${report.id}` },
    ];

    const groupedItems = report.items.reduce<Record<string, SharedReportItem[]>>((acc, item) => {
        const departmentName = item.investigation?.department?.name ?? 'General';
        if (!acc[departmentName]) {
            acc[departmentName] = [];
        }
        acc[departmentName].push(item);
        return acc;
    }, {});

    const displayStatus = report.status === 'published' ? 'Published' : report.status === 'sent' || report.status === 'received' ? 'Pending' : report.status;
    const statusClass = report.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Client report #${report.id}`} />
            <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Client report #{report.id}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('clinics.client.edit', report.id)}>Edit report</Link>
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
                </div>

                <div className="grid gap-2 rounded-lg border p-4 text-sm md:grid-cols-2">
                    <p>
                        <strong>Patient Name:</strong> {report.patient_name}
                    </p>
                    <p>
                        <strong>Sender Clinic:</strong> {report.sender?.clinic_name ?? '-'}
                    </p>
                    <p>
                        <strong>Status:</strong>{' '}
                        <span className={`rounded px-2 py-1 text-xs ${statusClass}`}>{displayStatus}</span>
                    </p>
                    <p>
                        <strong>Age/Gender:</strong> {report.patient_age} Y / {report.patient_sex}
                    </p>
                    <p>
                        <strong>Billing Date:</strong> {formatDateTimeInKolkata(report.billing_date)}
                    </p>
                    <p>
                        <strong>Address:</strong> {report.patient_address ?? '-'}
                    </p>
                    <p>
                        <strong>Collection Date:</strong> {formatDateTimeInKolkata(report.collection_date)}
                    </p>
                    <p>
                        <strong>Referred By:</strong> {report.patient_referred_by ?? '-'}
                    </p>
                    <p>
                        <strong>Report Date:</strong> {formatDateTimeInKolkata(report.report_date)}
                    </p>
                </div>

                <div className="space-y-5">
                    {Object.entries(groupedItems).map(([departmentName, items]) => (
                        <div key={departmentName} className="rounded-lg border p-4">
                            <h2 className="mb-3 text-base font-semibold tracking-wide text-slate-800 uppercase dark:text-slate-100">
                                Department: {departmentName}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500">
                                            <th className="py-2">Investigation</th>
                                            <th className="py-2">Value</th>
                                            <th className="py-2">Unit</th>
                                            <th className="py-2">Bio. Ref. Interval</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="py-2">
                                                    <div className="font-medium">{item.parameter_name}</div>
                                                    {item.method && <div className="text-xs text-slate-500">Method: {item.method}</div>}
                                                </td>
                                                <td className="py-2">{item.value ?? '-'}</td>
                                                <td className="py-2">{item.unit ?? '-'}</td>
                                                <td className="py-2">{item.bio_ref_interval ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
