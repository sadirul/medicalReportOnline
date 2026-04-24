import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { Head, Link } from '@inertiajs/react';
import { Building2, IndianRupee } from 'lucide-react';

export default function SuperadminDashboard({
    stats,
    latestTransactions,
}: {
    stats: { clinics_count: number; total_earning_this_year: number; total_earning_this_year_formatted: string; current_year: number };
    latestTransactions: Array<{
        id: number;
        clinic_id: number | null;
        clinic_name: string;
        amount: string;
        status: string;
        currency: string;
        transaction_id: string;
        created_at: string | null;
    }>;
}) {
    const formatDateTime12Hour = (value: string | null): string => {
        if (!value) {
            return '-';
        }

        const parsed = new Date(value.replace(' ', 'T'));
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(parsed);
    };

    const statusClass = (status: string): string => {
        if (status === 'captured') return 'bg-emerald-100 text-emerald-700';
        if (status === 'failed') return 'bg-rose-100 text-rose-700';
        return 'bg-amber-100 text-amber-700';
    };

    return (
        <SuperadminLayout title="Dashboard">
            <Head title="Superadmin Dashboard" />

            <h2 className="w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-100">Dashboard Overview</h2>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link href={route('superadmin.clinics.index')} className="block">
                    <Card className="border-sidebar-border/70 rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.clinics_count}</div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Clinics</CardTitle>
                            <CardDescription>Click to view all clinics</CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-sidebar-border/70 rounded-xl border bg-white shadow-sm dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <IndianRupee className="h-5 w-5" />
                        </div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.total_earning_this_year_formatted}</div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Earning</CardTitle>
                        <CardDescription>This year ({stats.current_year})</CardDescription>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-800">Last 15 Transactions</h3>
                    <Link href={route('superadmin.transactions.index')} className="text-sm font-medium text-blue-700 hover:underline">
                        All Transactions
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                            <tr>
                                <th className="px-3 py-2">Clinic</th>
                                <th className="px-3 py-2">Transaction ID</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Date Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestTransactions.length === 0 ? (
                                <tr>
                                    <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                latestTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-t">
                                        <td className="px-3 py-2">
                                            {transaction.clinic_id ? (
                                                <Link
                                                    href={route('superadmin.clinics.show', transaction.clinic_id)}
                                                    className="font-medium text-blue-700 hover:underline"
                                                >
                                                    {transaction.clinic_name}
                                                </Link>
                                            ) : (
                                                transaction.clinic_name
                                            )}
                                        </td>
                                        <td className="px-3 py-2">{transaction.transaction_id}</td>
                                        <td className="px-3 py-2">
                                            ₹ {transaction.amount}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClass(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">{formatDateTime12Hour(transaction.created_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SuperadminLayout>
    );
}
