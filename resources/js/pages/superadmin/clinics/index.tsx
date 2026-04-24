import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

type Clinic = {
    id: number;
    unique_clinic_id: string | null;
    clinic_name: string | null;
    full_name: string | null;
    mobile: string | null;
    sms_balance: number;
    created_at: string | null;
    expiry_datetime: string | null;
    status: 'active' | 'expired';
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ClinicsPaginated = {
    data: Clinic[];
    links: PaginationLink[];
};

type Filters = {
    status: string;
    q: string;
    sort: string;
};

export default function SuperadminClinicsIndex({ clinics, filters }: { clinics: ClinicsPaginated; filters: Filters }) {
    const [query, setQuery] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'newest');

    const activeFilters = useMemo(
        () => ({
            q: query || undefined,
            status: status || undefined,
            sort: sort || 'newest',
        }),
        [query, sort, status],
    );

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('superadmin.clinics.index'), activeFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setQuery('');
        setStatus('');
        setSort('newest');
        router.get(
            route('superadmin.clinics.index'),
            { sort: 'newest' },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <SuperadminLayout title="Clinics">
            <Head title="Superadmin Clinics" />

            <h2 className="w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-100">Clinic List</h2>
            <div className="space-y-4">
                <form onSubmit={applyFilters} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4">
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="q">Search</Label>
                        <Input
                            id="q"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Clinic name, clinic ID, or mobile"
                        />
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
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sort">Sort</Label>
                        <select
                            id="sort"
                            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2 md:col-span-4">
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
                                <th className="px-4 py-3">Clinic</th>
                                <th className="px-4 py-3">Clinic ID</th>
                                <th className="px-4 py-3">Mobile</th>
                                <th className="px-4 py-3">SMS</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clinics.data.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                                        No clinics found.
                                    </td>
                                </tr>
                            ) : (
                                clinics.data.map((clinic) => (
                                    <tr key={clinic.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{clinic.clinic_name ?? '-'}</p>
                                            <p className="text-xs text-slate-500">{clinic.full_name ?? '-'}</p>
                                        </td>
                                        <td className="px-4 py-3">{clinic.unique_clinic_id ?? '-'}</td>
                                        <td className="px-4 py-3">{clinic.mobile ?? '-'}</td>
                                        <td className="px-4 py-3">{clinic.sms_balance}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={clinic.status === 'expired' ? 'destructive' : 'default'}>
                                                {clinic.status === 'expired' ? 'Expired' : 'Active'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">{clinic.created_at ?? '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('superadmin.clinics.show', clinic.id)}>View</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {clinics.links.map((link, index) => (
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
            </div>
        </SuperadminLayout>
    );
}
