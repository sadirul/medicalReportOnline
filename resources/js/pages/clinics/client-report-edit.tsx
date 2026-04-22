import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Building2, FlaskConical, PlusCircle, Trash2 } from 'lucide-react';

type Investigation = {
    id: number;
    department_id: number;
    name: string;
    department?: { id: number; name: string };
    unit?: string | null;
    bio_ref_interval?: string | null;
};

type EditableSharedReport = {
    id: number;
    status: string;
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
    sender?: { clinic_name: string; full_name: string };
    items: Array<{
        investigation_id?: number | null;
        department_id?: number | null;
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

const blankDepartmentRow = (): DepartmentRow => ({
    department_id: '',
    investigations: [blankInvestigationRow()],
});

export default function ClientReportEdit({
    report,
    departments,
    investigations,
}: {
    report: EditableSharedReport;
    departments: { id: number; name: string }[];
    investigations: Investigation[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client report', href: '/clinics/other-clinic/client-report' },
        { title: `Edit #${report.id}`, href: `/clinics/other-clinic/client-report/${report.id}/edit` },
    ];

    const departmentRowsFromReport = (reportData: EditableSharedReport): DepartmentRow[] => {
        if (!reportData.items || reportData.items.length === 0) {
            return [blankDepartmentRow()];
        }

        const rowsByDepartment = new Map<string, InvestigationRow[]>();
        reportData.items.forEach((item) => {
            const departmentId = item.department_id
                ? String(item.department_id)
                : item.investigation?.department?.id
                  ? String(item.investigation.department.id)
                  : '';
            const existing = rowsByDepartment.get(departmentId) ?? [];
            existing.push({
                investigation_id: item.investigation_id ? String(item.investigation_id) : '',
                parameter_name: item.parameter_name ?? '',
                method: item.method ?? '',
                value: item.value ?? '',
                unit: item.unit ?? '',
                bio_ref_interval: item.bio_ref_interval ?? '',
            });
            rowsByDepartment.set(departmentId, existing);
        });

        return Array.from(rowsByDepartment.entries()).map(([department_id, rows]) => ({
            department_id,
            investigations: rows.length > 0 ? rows : [blankInvestigationRow()],
        }));
    };

    const { data, setData, patch, transform, errors, processing } = useForm({
        patient_name: report.patient_name ?? '',
        patient_age: String(report.patient_age ?? ''),
        patient_sex: report.patient_sex ?? '',
        patient_address: report.patient_address ?? '',
        patient_referred_by: report.patient_referred_by ?? '',
        patient_whatsapp_number: report.patient_whatsapp_number ?? '',
        billing_date: report.billing_date?.slice(0, 16) ?? '',
        collection_date: report.collection_date?.slice(0, 16) ?? '',
        report_date: report.report_date?.slice(0, 16) ?? '',
        include_header_footer: report.include_header_footer ?? false,
        sample_note: report.sample_note ?? '',
        equipment_note: report.equipment_note ?? '',
        interpretation_note: report.interpretation_note ?? '',
        department_rows: departmentRowsFromReport(report),
    });
    const reportErrors = errors as Record<string, string | undefined>;

    const updateInvestigationRow = (rowIndex: number, investigationIndex: number, key: keyof InvestigationRow, value: string) => {
        const rows = [...data.department_rows];
        const investigationsForRow = [...rows[rowIndex].investigations];
        investigationsForRow[investigationIndex] = { ...investigationsForRow[investigationIndex], [key]: value };
        rows[rowIndex] = { ...rows[rowIndex], investigations: investigationsForRow };
        setData('department_rows', rows);
    };

    const onDepartmentChange = (rowIndex: number, departmentId: string) => {
        const rows = [...data.department_rows];
        rows[rowIndex] = {
            ...rows[rowIndex],
            department_id: departmentId,
            investigations: rows[rowIndex].investigations.map(() => blankInvestigationRow()),
        };
        setData('department_rows', rows);
    };

    const onInvestigationChange = (rowIndex: number, investigationIndex: number, investigationId: string) => {
        const selectedInvestigation = investigations.find((investigation) => String(investigation.id) === investigationId);
        const rows = [...data.department_rows];
        const investigationsForRow = [...rows[rowIndex].investigations];

        investigationsForRow[investigationIndex] = {
            investigation_id: investigationId,
            parameter_name: selectedInvestigation?.name ?? '',
            method: '',
            value: investigationsForRow[investigationIndex].value,
            unit: selectedInvestigation?.unit ?? '',
            bio_ref_interval: selectedInvestigation?.bio_ref_interval ?? '',
        };

        rows[rowIndex] = { ...rows[rowIndex], investigations: investigationsForRow };
        setData('department_rows', rows);
    };

    const addDepartmentRow = () => setData('department_rows', [...data.department_rows, blankDepartmentRow()]);
    const removeDepartmentRow = (rowIndex: number) => {
        if (data.department_rows.length === 1) return;
        setData('department_rows', data.department_rows.filter((_, index) => index !== rowIndex));
    };
    const addInvestigationUnderDepartment = (rowIndex: number) => {
        const rows = [...data.department_rows];
        rows[rowIndex] = { ...rows[rowIndex], investigations: [...rows[rowIndex].investigations, blankInvestigationRow()] };
        setData('department_rows', rows);
    };
    const removeInvestigationRow = (rowIndex: number, investigationIndex: number) => {
        const rows = [...data.department_rows];
        if (rows[rowIndex].investigations.length === 1) return;
        rows[rowIndex] = { ...rows[rowIndex], investigations: rows[rowIndex].investigations.filter((_, index) => index !== investigationIndex) };
        setData('department_rows', rows);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        const items = data.department_rows.flatMap((row) =>
            row.investigations.map((investigation) => ({
                department_id: row.department_id,
                ...investigation,
            })),
        );

        transform(() => ({
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
            _method: 'patch' as const,
        }));

        patch(route('clinics.client.update', report.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Client report #${report.id}`} />
            <form onSubmit={submit} className="space-y-6 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Sender clinic: <span className="font-semibold">{report.sender?.clinic_name ?? '-'}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('clinics.client.index')}>Back</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            asChild
                        >
                            <Link href={route('clinics.client.publish', report.id)} method="post" as="button">
                                Publish
                            </Link>
                        </Button>
                    </div>
                </div>

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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="patient_referred_by">Referred By</Label>
                        <Input id="patient_referred_by" value={data.patient_referred_by} onChange={(e) => setData('patient_referred_by', e.target.value)} />
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
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="billing_date">Billing Date</Label>
                        <Input id="billing_date" type="datetime-local" value={data.billing_date} onChange={(e) => setData('billing_date', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="collection_date">Collection Date</Label>
                        <Input id="collection_date" type="datetime-local" value={data.collection_date} onChange={(e) => setData('collection_date', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="report_date">Report Date</Label>
                        <Input id="report_date" type="datetime-local" value={data.report_date} onChange={(e) => setData('report_date', e.target.value)} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                            <Building2 className="h-4 w-4" />
                            Departments with tests
                        </h3>
                        <Button type="button" variant="outline" onClick={addDepartmentRow} className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950/40">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add department row
                        </Button>
                    </div>
                    {data.department_rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="space-y-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/60 p-3 dark:border-l-blue-400 dark:bg-blue-950/25">
                            <div className="flex items-end gap-2">
                                <div className="grid flex-1 gap-1">
                                    <Label className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                        <Building2 className="h-4 w-4" />
                                        Department row
                                    </Label>
                                    <select value={row.department_id} onChange={(e) => onDepartmentChange(rowIndex, e.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900">
                                        <option value="">Select department</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="button" variant="outline" onClick={() => removeDepartmentRow(rowIndex)} className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove department
                                </Button>
                            </div>
                            {row.investigations.map((investigationRow, investigationIndex) => (
                                <div key={`${rowIndex}-${investigationIndex}`} className="grid gap-2 md:grid-cols-6">
                                    <select value={investigationRow.investigation_id} onChange={(e) => onInvestigationChange(rowIndex, investigationIndex, e.target.value)} disabled={!row.department_id} className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900">
                                        <option value="">{row.department_id ? 'Select test' : 'Select department first'}</option>
                                        {investigations
                                            .filter((investigation) => row.department_id && String(investigation.department_id) === row.department_id)
                                            .map((investigation) => (
                                                <option key={investigation.id} value={investigation.id}>
                                                    {investigation.name}
                                                </option>
                                            ))}
                                    </select>
                                    <Input value={investigationRow.parameter_name} onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'parameter_name', e.target.value)} placeholder="Test name" />
                                    <Input value={investigationRow.value} onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'value', e.target.value)} placeholder="Result value" />
                                    <Input value={investigationRow.unit} onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'unit', e.target.value)} placeholder="Unit" />
                                    <Input value={investigationRow.bio_ref_interval} onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'bio_ref_interval', e.target.value)} placeholder="Interval" />
                                    <Button type="button" variant="outline" onClick={() => removeInvestigationRow(rowIndex, investigationIndex)} className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove row
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => addInvestigationUnderDepartment(rowIndex)} disabled={!row.department_id} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
                                    <FlaskConical className="mr-2 h-4 w-4" />
                                    Add test row
                                </Button>
                            </div>
                        </div>
                    ))}
                    <InputError message={reportErrors.items || reportErrors['items.0.department_id'] || reportErrors['items.0.investigation_id']} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="sample_note">Sample note</Label>
                        <Input id="sample_note" value={data.sample_note} onChange={(e) => setData('sample_note', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="equipment_note">Equipment note</Label>
                        <Input id="equipment_note" value={data.equipment_note} onChange={(e) => setData('equipment_note', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="interpretation_note">Interpretation note</Label>
                        <Input id="interpretation_note" value={data.interpretation_note} onChange={(e) => setData('interpretation_note', e.target.value)} />
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
                </div>

                <Button disabled={processing}>Save report</Button>
            </form>
        </AppLayout>
    );
}
