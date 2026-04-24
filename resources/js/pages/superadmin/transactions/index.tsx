import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Transaction = {
    id: number;
    clinic_id: number | null;
    clinic_name: string;
    order_id: string;
    transaction_id: string;
    amount: string;
    status: string;
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TransactionsPaginated = {
    data: Transaction[];
    links: PaginationLink[];
};

type ClinicOption = {
    id: number;
    name: string;
};

type Filters = {
    clinic_id: string;
    order_id: string;
    transaction_id: string;
    status: string;
    from_date: string;
    to_date: string;
};

export default function SuperadminTransactionsIndex({
    transactions,
    clinics,
    filters,
}: {
    transactions: TransactionsPaginated;
    clinics: ClinicOption[];
    filters: Filters;
}) {
    const [clinicId, setClinicId] = useState(filters.clinic_id ?? '');
    const [orderId, setOrderId] = useState(filters.order_id ?? '');
    const [transactionId, setTransactionId] = useState(filters.transaction_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [fromDate, setFromDate] = useState(filters.from_date ?? '');
    const [toDate, setToDate] = useState(filters.to_date ?? '');

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route('superadmin.transactions.index'),
            {
                clinic_id: clinicId || undefined,
                order_id: orderId || undefined,
                transaction_id: transactionId || undefined,
                status: status || undefined,
                from_date: fromDate || undefined,
                to_date: toDate || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setClinicId('');
        setOrderId('');
        setTransactionId('');
        setStatus('');
        setFromDate('');
        setToDate('');
        router.get(route('superadmin.transactions.index'), {}, { preserveState: true, replace: true });
    };

    const formatDateTime12Hour = (value: string | null): string => {
        if (!value) return '-';
        const parsed = new Date(value.replace(' ', 'T'));
        if (Number.isNaN(parsed.getTime())) return value;
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(parsed);
    };

    const statusClass = (value: string): string => {
        if (value === 'captured') return 'bg-emerald-100 text-emerald-700';
        if (value === 'failed') return 'bg-rose-100 text-rose-700';
        return 'bg-amber-100 text-amber-700';
    };

    return (
        <SuperadminLayout title="Transactions">
            <Head title="All Transactions" />

            <h2 className="w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-100">All Transactions</h2>

            <form onSubmit={submitFilters} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="grid gap-2">
                    <Label htmlFor="clinic_id">Clinic</Label>
                    <select
                        id="clinic_id"
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        value={clinicId}
                        onChange={(event) => setClinicId(event.target.value)}
                    >
                        <option value="">All</option>
                        {clinics.map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>
                                {clinic.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="order_id">Order ID</Label>
                    <Input id="order_id" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="transaction_id">Transaction ID</Label>
                    <Input id="transaction_id" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <option value="">All</option>
                        <option value="created">Created</option>
                        <option value="captured">Captured</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="from_date">From Date</Label>
                    <Input id="from_date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="to_date">To Date</Label>
                    <Input id="to_date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                </div>

                <div className="flex items-end gap-2 md:col-span-3 lg:col-span-6">
                    <Button type="submit">Apply filters</Button>
                    <Button type="button" variant="outline" onClick={resetFilters}>
                        Reset
                    </Button>
                </div>
            </form>

            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                        <tr>
                            <th className="px-3 py-2">Clinic</th>
                            <th className="px-3 py-2">Order ID</th>
                            <th className="px-3 py-2">Transaction ID</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Date Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.data.length === 0 ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.data.map((transaction) => (
                                <tr key={transaction.id} className="border-t">
                                    <td className="px-3 py-2">
                                        {transaction.clinic_id ? (
                                            <Link href={route('superadmin.clinics.show', transaction.clinic_id)} className="font-medium text-blue-700 hover:underline">
                                                {transaction.clinic_name}
                                            </Link>
                                        ) : (
                                            transaction.clinic_name
                                        )}
                                    </td>
                                    <td className="px-3 py-2">{transaction.order_id}</td>
                                    <td className="px-3 py-2">{transaction.transaction_id}</td>
                                    <td className="px-3 py-2">₹ {transaction.amount}</td>
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

            <div className="flex flex-wrap gap-2">
                {transactions.links.map((link, index) => (
                    <Button key={`${link.label}-${index}`} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url} asChild={!!link.url}>
                        {link.url ? (
                            <Link href={link.url} preserveState>
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                    </Button>
                ))}
            </div>
        </SuperadminLayout>
    );
}
