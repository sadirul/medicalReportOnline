import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All report',
        href: '/reports/all-report',
    },
];

type ReportRow = {
    id: number;
    billing_date: string;
    collection_date: string;
    report_date: string;
    department?: string | null;
    patient: {
        name: string;
        v_id: string;
    };
};

const dateTime = (value: string) => new Date(value).toLocaleString();

export default function AllReport({ reports }: { reports: ReportRow[] }) {
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
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="py-2">Patient</th>
                                <th className="py-2">V.Id</th>
                                <th className="py-2">Billing Date</th>
                                <th className="py-2">Report Date</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-5 text-center text-slate-500">
                                        No reports created yet.
                                    </td>
                                </tr>
                            )}
                            {reports.map((report) => (
                                <tr key={report.id} className="border-t">
                                    <td className="py-2">{report.patient.name}</td>
                                    <td className="py-2">{report.patient.v_id}</td>
                                    <td className="py-2">{dateTime(report.billing_date)}</td>
                                    <td className="py-2">{dateTime(report.report_date)}</td>
                                    <td className="py-2">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('reports.show', report.id)}>View</Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <a href={route('reports.pdf', report.id)}>Download PDF</a>
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
