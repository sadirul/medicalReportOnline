import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type ReportItem = {
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

type Report = {
    id: number;
    department?: string | null;
    billing_date: string;
    collection_date: string;
    report_date: string;
    sample_note?: string | null;
    equipment_note?: string | null;
    interpretation_note?: string | null;
    patient: {
        name: string;
        v_id: string;
        age: number;
        sex: string;
        address?: string | null;
        referred_by?: string | null;
    };
    items: ReportItem[];
};

const dateTime = (value: string) => new Date(value).toLocaleString();

export default function ShowReport({ report }: { report: Report }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'All report', href: '/reports/all-report' },
        { title: `Report #${report.id}`, href: `/reports/${report.id}` },
    ];

    const groupedItems = report.items.reduce<Record<string, ReportItem[]>>((acc, item) => {
        const departmentName = item.investigation?.department?.name ?? 'General';
        if (!acc[departmentName]) {
            acc[departmentName] = [];
        }
        acc[departmentName].push(item);
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Report #${report.id}`} />
            <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Report #{report.id}</h1>
                    <Button asChild>
                        <a href={route('reports.pdf', report.id)}>Download PDF</a>
                    </Button>
                </div>

                <div className="grid gap-2 rounded-lg border p-4 text-sm md:grid-cols-2">
                    <p>
                        <strong>Patient Name:</strong> {report.patient.name}
                    </p>
                    <p>
                        <strong>V.Id:</strong> {report.patient.v_id}
                    </p>
                    <p>
                        <strong>Age/Sex:</strong> {report.patient.age} Y / {report.patient.sex}
                    </p>
                    <p>
                        <strong>Billing Date:</strong> {dateTime(report.billing_date)}
                    </p>
                    <p>
                        <strong>Address:</strong> {report.patient.address ?? '-'}
                    </p>
                    <p>
                        <strong>Collection Date:</strong> {dateTime(report.collection_date)}
                    </p>
                    <p>
                        <strong>Referred By:</strong> {report.patient.referred_by ?? '-'}
                    </p>
                    <p>
                        <strong>Report Date:</strong> {dateTime(report.report_date)}
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
