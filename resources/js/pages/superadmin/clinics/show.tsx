import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

type Clinic = {
    id: number;
    unique_clinic_id: string | null;
    clinic_name: string | null;
    full_name: string | null;
    mobile: string | null;
    email: string | null;
    address: string | null;
    sms_balance: number;
    status: 'active' | 'expired';
    expiry_datetime: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type Stats = {
    reports_count: number;
    sent_reports_count: number;
    received_reports_count: number;
    initiated_connections_count: number;
    received_connections_count: number;
    total_connections_count: number;
};

type Transaction = {
    id: number;
    amount: string;
    status: string;
    currency: string;
    transaction_id: string;
    created_at: string | null;
};

export default function SuperadminClinicShow({ clinic, stats, transactions }: { clinic: Clinic; stats: Stats; transactions: Transaction[] }) {
    const [smsOpen, setSmsOpen] = useState(false);
    const [expiryOpen, setExpiryOpen] = useState(false);
    const smsForm = useForm({
        sms_count: '',
    });
    const expiryForm = useForm({
        expiry_datetime: clinic.expiry_datetime ? clinic.expiry_datetime.slice(0, 16).replace(' ', 'T') : '',
    });

    const submitSms = () => {
        smsForm.post(route('superadmin.clinics.sms.add', clinic.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSmsOpen(false);
                smsForm.reset();
            },
        });
    };

    const submitExpiry = () => {
        expiryForm.post(route('superadmin.clinics.expiry.update', clinic.id), {
            preserveScroll: true,
            onSuccess: () => {
                setExpiryOpen(false);
            },
        });
    };

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
        <SuperadminLayout title={`Clinic #${clinic.id}`}>
            <Head title={clinic.clinic_name ?? 'Clinic Details'} />

            <h2 className="w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-100">Clinic Details</h2>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">{clinic.clinic_name ?? '-'}</h2>
                        <p className="text-sm text-slate-600">{clinic.unique_clinic_id ?? '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={clinic.status === 'expired' ? 'destructive' : 'default'}>
                            {clinic.status === 'expired' ? 'Expired' : 'Active'}
                        </Badge>
                        <Button variant="outline" asChild>
                            <Link href={route('superadmin.clinics.index')}>Back to list</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold">Clinic Info</h3>
                            <div className="flex items-center gap-2">
                                <Dialog open={expiryOpen} onOpenChange={setExpiryOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline">
                                            Change Expiry
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Expiry Datetime</DialogTitle>
                                            <DialogDescription>Set a new expiry datetime for this clinic.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-2">
                                            <Label htmlFor="expiry_datetime">Expiry Datetime</Label>
                                            <Input
                                                id="expiry_datetime"
                                                type="datetime-local"
                                                value={expiryForm.data.expiry_datetime}
                                                onChange={(event) => expiryForm.setData('expiry_datetime', event.target.value)}
                                            />
                                            <InputError message={expiryForm.errors.expiry_datetime} />
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" type="button">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button type="button" onClick={submitExpiry} disabled={expiryForm.processing}>
                                                Update Expiry
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button">Add SMS</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add SMS</DialogTitle>
                                            <DialogDescription>Add SMS count to current clinic balance.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sms_count">SMS Count</Label>
                                            <Input
                                                id="sms_count"
                                                type="number"
                                                min="1"
                                                value={smsForm.data.sms_count}
                                                onChange={(event) => smsForm.setData('sms_count', event.target.value.replace(/\D/g, ''))}
                                            />
                                            <InputError message={smsForm.errors.sms_count} />
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" type="button">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button type="button" onClick={submitSms} disabled={smsForm.processing}>
                                                Add SMS
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                            <p>
                                <span className="font-medium">Owner:</span> {clinic.full_name ?? '-'}
                            </p>
                            <p>
                                <span className="font-medium">Mobile:</span> {clinic.mobile ?? '-'}
                            </p>
                            <p>
                                <span className="font-medium">Email:</span> {clinic.email ?? '-'}
                            </p>
                            <p>
                                <span className="font-medium">SMS Balance:</span> {clinic.sms_balance}
                            </p>
                            <p className="md:col-span-2">
                                <span className="font-medium">Address:</span> {clinic.address ?? '-'}
                            </p>
                            <p>
                                <span className="font-medium">Expiry:</span> {formatDateTime12Hour(clinic.expiry_datetime)}
                            </p>
                            <p>
                                <span className="font-medium">Created:</span> {formatDateTime12Hour(clinic.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
                        <h3 className="text-base font-semibold">Activity Stats</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md border p-3">
                                <p className="text-slate-500">Reports</p>
                                <p className="text-xl font-semibold">{stats.reports_count}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-slate-500">Sent Reports</p>
                                <p className="text-xl font-semibold">{stats.sent_reports_count}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-slate-500">Received Reports</p>
                                <p className="text-xl font-semibold">{stats.received_reports_count}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-slate-500">Connections</p>
                                <p className="text-xl font-semibold">{stats.total_connections_count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold">Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                                <tr>
                                    <th className="px-3 py-2">Transaction ID</th>
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Date Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
                                            No transactions found for this clinic.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-t">
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
                </div>
            </div>
        </SuperadminLayout>
    );
}
