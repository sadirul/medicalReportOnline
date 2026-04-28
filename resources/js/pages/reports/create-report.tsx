import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, KeyboardEvent, useMemo, useState } from 'react';
import { DoctorCombobox, type DoctorOption } from '@/components/doctor-combobox';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, FlaskConical, Search, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create report',
        href: '/reports/create-report',
    },
];

type Investigation = {
    id: number;
    department_id: number;
    name: string;
    department?: { id: number; name: string };
    unit?: string | null;
    bio_ref_interval?: string | null;
};

type EditableReport = {
    id: number;
    patient_name: string;
    patient_age: number;
    patient_sex: string;
    patient_address?: string | null;
    patient_referred_by?: string | null;
    patient_whatsapp_number?: string | null;
    billing_date: string;
    collection_date: string;
    report_date: string;
    include_header_footer?: boolean;
    sample_note?: string | null;
    equipment_note?: string | null;
    interpretation_note?: string | null;
    items: Array<{
        investigation_id?: number | null;
        parameter_name: string;
        method?: string | null;
        value?: string | null;
        unit?: string | null;
        bio_ref_interval?: string | null;
        investigation?: {
            department?: {
                id: number;
            } | null;
        } | null;
    }>;
};

type InvestigationRow = {
    investigation_id: string;
    parameter_name: string;
    method: string;
    value: string;
    unit: string;
    bio_ref_interval: string;
};

type DepartmentRow = {
    department_id: string;
    investigations: InvestigationRow[];
};

const blankInvestigationRow = (): InvestigationRow => ({
    investigation_id: '',
    parameter_name: '',
    method: '',
    value: '',
    unit: '',
    bio_ref_interval: '',
});

const dateForInput = () => {
    const date = new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

export default function CreateReport({
    investigations,
    doctors,
    report,
}: {
    departments: { id: number; name: string }[];
    investigations: Investigation[];
    doctors: DoctorOption[];
    report: EditableReport | null;
}) {
    const isEdit = !!report;
    const [testSearch, setTestSearch] = useState('');
    const [activeTestIndex, setActiveTestIndex] = useState(0);

    const departmentRowsFromReport = (reportData: EditableReport | null): DepartmentRow[] => {
        if (!reportData || reportData.items.length === 0) {
            return [];
        }

        return reportData.items.map((item) => {
            const departmentId = item.investigation?.department?.id ? String(item.investigation.department.id) : '';
            return {
                department_id: departmentId,
                investigations: [
                    {
                        investigation_id: item.investigation_id ? String(item.investigation_id) : '',
                        parameter_name: item.parameter_name ?? '',
                        method: item.method ?? '',
                        value: item.value ?? '',
                        unit: item.unit ?? '',
                        bio_ref_interval: item.bio_ref_interval ?? '',
                    },
                ],
            };
        });
    };

    const { data, setData, post, transform, errors, processing } = useForm({
        patient_name: report?.patient_name ?? '',
        patient_age: report ? String(report.patient_age) : '',
        patient_sex: report?.patient_sex ?? '',
        patient_address: report?.patient_address ?? '',
        patient_referred_by: report?.patient_referred_by ?? '',
        patient_whatsapp_number: report?.patient_whatsapp_number ?? '',
        billing_date: report ? report.billing_date.slice(0, 16) : dateForInput(),
        collection_date: report ? report.collection_date.slice(0, 16) : dateForInput(),
        report_date: report ? report.report_date.slice(0, 16) : dateForInput(),
        include_header_footer: report?.include_header_footer ?? false,
        sample_note: report?.sample_note ?? '',
        equipment_note: report?.equipment_note ?? '',
        interpretation_note: report?.interpretation_note ?? '',
        department_rows: departmentRowsFromReport(report),
    });
    const reportErrors = errors as Record<string, string | undefined>;
    const selectedInvestigationIds = useMemo(
        () => new Set(data.department_rows.flatMap((row) => row.investigations.map((investigation) => investigation.investigation_id).filter(Boolean))),
        [data.department_rows],
    );
    const filteredInvestigations = useMemo(() => {
        const query = testSearch.trim().toLowerCase();

        return investigations.filter((investigation) => {
            const haystack = `${investigation.name} ${investigation.department?.name ?? ''}`.toLowerCase();
            return query !== '' && haystack.includes(query);
        });
    }, [investigations, testSearch]);
    const selectableInvestigations = useMemo(
        () => filteredInvestigations.filter((investigation) => !selectedInvestigationIds.has(String(investigation.id))),
        [filteredInvestigations, selectedInvestigationIds],
    );
    const activeInvestigation = selectableInvestigations[Math.min(activeTestIndex, Math.max(selectableInvestigations.length - 1, 0))];

    const updateInvestigationRow = (rowIndex: number, investigationIndex: number, key: keyof InvestigationRow, value: string) => {
        const rows = [...data.department_rows];
        const investigationsForRow = [...rows[rowIndex].investigations];
        investigationsForRow[investigationIndex] = { ...investigationsForRow[investigationIndex], [key]: value };
        rows[rowIndex] = { ...rows[rowIndex], investigations: investigationsForRow };
        setData('department_rows', rows);
    };

    const addInvestigationRow = (investigationId: string) => {
        if (!investigationId || selectedInvestigationIds.has(investigationId)) {
            return;
        }

        const selectedInvestigation = investigations.find((investigation) => String(investigation.id) === investigationId);
        if (!selectedInvestigation) {
            return;
        }

        setData('department_rows', [
            ...data.department_rows,
            {
                department_id: String(selectedInvestigation.department_id),
                investigations: [
                    {
                        investigation_id: investigationId,
                        parameter_name: selectedInvestigation.name,
                        method: '',
                        value: '',
                        unit: selectedInvestigation.unit ?? '',
                        bio_ref_interval: selectedInvestigation.bio_ref_interval ?? '',
                    },
                ],
            },
        ]);
        setTestSearch('');
        setActiveTestIndex(0);
    };

    const handleTestPickerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveTestIndex((index) => (selectableInvestigations.length === 0 ? 0 : Math.min(index + 1, selectableInvestigations.length - 1)));
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveTestIndex((index) => Math.max(index - 1, 0));
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            if (activeInvestigation) {
                addInvestigationRow(String(activeInvestigation.id));
            }
            return;
        }

        if (event.key === 'Delete') {
            event.preventDefault();
            setTestSearch('');
            setActiveTestIndex(0);
        }
    };

    const removeTestRow = (rowIndex: number) => {
        setData(
            'department_rows',
            data.department_rows.filter((_, index) => index !== rowIndex),
        );
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        const items = data.department_rows.flatMap((row) =>
            row.investigations.map((investigation) => ({
                department_id: row.department_id,
                ...investigation,
            })),
        );

        const payload = {
            patient_name: data.patient_name,
            patient_age: data.patient_age,
            patient_sex: data.patient_sex,
            patient_address: data.patient_address,
            patient_referred_by: data.patient_referred_by,
            patient_whatsapp_number: data.patient_whatsapp_number,
            billing_date: data.billing_date,
            collection_date: data.collection_date,
            report_date: data.report_date,
            include_header_footer: data.include_header_footer,
            sample_note: data.sample_note,
            equipment_note: data.equipment_note,
            interpretation_note: data.interpretation_note,
            items,
            ...(isEdit ? { _method: 'patch' as const } : {}),
        };

        transform(() => payload);

        post(isEdit ? route('reports.update', report!.id) : route('reports.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit report' : 'Create report'} />
            <form onSubmit={submit} className="space-y-6 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_name">Patient Name</Label>
                        <Input id="patient_name" value={data.patient_name} onChange={(e) => setData('patient_name', e.target.value)} />
                        <InputError message={errors.patient_name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="patient_age">Age</Label>
                        <Input id="patient_age" type="number" min={0} value={data.patient_age} onChange={(e) => setData('patient_age', e.target.value)} />
                        <InputError message={errors.patient_age} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="patient_sex">Gender</Label>
                        <select
                            id="patient_sex"
                            value={data.patient_sex}
                            onChange={(e) => setData('patient_sex', e.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <InputError message={errors.patient_sex} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_address">Address</Label>
                        <Input id="patient_address" value={data.patient_address} onChange={(e) => setData('patient_address', e.target.value)} />
                        <InputError message={errors.patient_address} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="patient_referred_by">Referred By Dr</Label>
                        <DoctorCombobox doctors={doctors} value={data.patient_referred_by} onChange={(value) => setData('patient_referred_by', value)} />
                        <InputError message={errors.patient_referred_by} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="patient_whatsapp_number">WhatsApp Number</Label>
                        <Input
                            id="patient_whatsapp_number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            value={data.patient_whatsapp_number}
                            onChange={(e) => setData('patient_whatsapp_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                        <InputError message={errors.patient_whatsapp_number} />
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="billing_date">Billing Date</Label>
                        <Input id="billing_date" type="datetime-local" value={data.billing_date} onChange={(e) => setData('billing_date', e.target.value)} />
                        <InputError message={errors.billing_date} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="collection_date">Collection Date</Label>
                        <Input id="collection_date" type="datetime-local" value={data.collection_date} onChange={(e) => setData('collection_date', e.target.value)} />
                        <InputError message={errors.collection_date} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="report_date">Report Date</Label>
                        <Input id="report_date" type="datetime-local" value={data.report_date} onChange={(e) => setData('report_date', e.target.value)} />
                        <InputError message={errors.report_date} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/60 dark:bg-blue-950/25">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                            <FlaskConical className="h-4 w-4" />
                            Add test
                        </h3>
                        <div className="grid gap-1">
                            <Label htmlFor="test_picker_search" className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                <Search className="h-4 w-4" />
                                Choose test
                            </Label>
                            <div className="relative">
                                <div className="">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="test_picker_search"
                                            autoFocus
                                            value={testSearch}
                                            onChange={(event) => {
                                                setTestSearch(event.target.value);
                                                setActiveTestIndex(0);
                                            }}
                                            onKeyDown={handleTestPickerKeyDown}
                                            placeholder="Search test"
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="mt-2 max-h-64 overflow-y-auto">
                                        {/* {filteredInvestigations.length === 0 && (
                                            <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                                                {testSearch.trim() === '' ? 'Start typing to search for tests...' : 'No tests found.'}
                                            </div>
                                        )} */}
                                        {filteredInvestigations.map((investigation) => {
                                            const investigationId = String(investigation.id);
                                            const isAdded = selectedInvestigationIds.has(investigationId);
                                            const selectableIndex = selectableInvestigations.findIndex((item) => item.id === investigation.id);
                                            const isActive = selectableIndex === activeTestIndex && !isAdded;

                                            return (
                                                <button
                                                    key={investigation.id}
                                                    type="button"
                                                    onClick={() => addInvestigationRow(investigationId)}
                                                    onMouseEnter={() => {
                                                        if (selectableIndex >= 0) {
                                                            setActiveTestIndex(selectableIndex);
                                                        }
                                                    }}
                                                    disabled={isAdded}
                                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent ${
                                                        isActive
                                                            ? 'bg-blue-600 text-white'
                                                            : 'hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                                    }`}
                                                >
                                                    <span className="truncate">{investigation.name}</span>
                                                    {isAdded && <span className="ml-2 shrink-0 text-xs">Added</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {data.department_rows.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                            No tests added yet.
                        </div>
                    )}

                    {data.department_rows.map((row, rowIndex) => {
                        const investigationRow = row.investigations[0] ?? blankInvestigationRow();

                        return (
                            <div key={rowIndex} className="grid gap-2 rounded-lg border bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
                                <Input
                                    placeholder="Test name"
                                    value={investigationRow.parameter_name}
                                    onChange={(e) => updateInvestigationRow(rowIndex, 0, 'parameter_name', e.target.value)}
                                />
                                <Input
                                    placeholder="Result value"
                                    value={investigationRow.value}
                                    onChange={(e) => updateInvestigationRow(rowIndex, 0, 'value', e.target.value)}
                                />
                                <Input
                                    placeholder="Unit"
                                    value={investigationRow.unit}
                                    onChange={(e) => updateInvestigationRow(rowIndex, 0, 'unit', e.target.value)}
                                />
                                <Input
                                    placeholder="Interval"
                                    value={investigationRow.bio_ref_interval}
                                    onChange={(e) => updateInvestigationRow(rowIndex, 0, 'bio_ref_interval', e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeTestRow(rowIndex)}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                        );
                    })}
                    <InputError message={reportErrors.items || reportErrors['items.0.department_id'] || reportErrors['items.0.investigation_id']} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="sample_note">Sample note</Label>
                        <Input id="sample_note" value={data.sample_note} onChange={(e) => setData('sample_note', e.target.value)} placeholder="Sample: EDTA-Whole Blood." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="equipment_note">Equipment note</Label>
                        <Input id="equipment_note" value={data.equipment_note} onChange={(e) => setData('equipment_note', e.target.value)} placeholder="Equipment Used: Sysmex XN-1000 Cell Counter." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="interpretation_note">Comments</Label>
                        <Input id="interpretation_note" value={data.interpretation_note} onChange={(e) => setData('interpretation_note', e.target.value)} placeholder="Please correlate with clinical conditions." />
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={data.include_header_footer}
                            onChange={(e) => setData('include_header_footer', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Header/Footer
                    </label>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        If checked, uploaded profile header and footer images will be shown in report PDF.
                    </p>
                </div>

                <Button disabled={processing}>{isEdit ? 'Update report' : 'Create report'}</Button>
            </form>
        </AppLayout>
    );
}
