import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create report',
        href: '/reports/create-report',
    },
];

type Patient = {
    id: number;
    name: string;
    v_id: string;
    age: number;
    sex: string;
    address?: string | null;
    referred_by?: string | null;
};

type Investigation = {
    id: number;
    department_id: number;
    name: string;
    department?: { id: number; name: string };
    unit?: string | null;
    bio_ref_interval?: string | null;
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

const dateForInput = () => {
    const date = new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

export default function CreateReport({
    patient,
    patients,
    departments,
    investigations,
}: {
    patient: Patient | null;
    patients: Patient[];
    departments: { id: number; name: string }[];
    investigations: Investigation[];
}) {
    const { data, setData, post, transform, errors, processing } = useForm({
        patient_id: patient?.id ? String(patient.id) : '',
        billing_date: dateForInput(),
        collection_date: dateForInput(),
        report_date: dateForInput(),
        sample_note: '',
        equipment_note: '',
        interpretation_note: '',
        department_rows: [blankDepartmentRow()],
    });

    const selectedPatient = patients.find((entry) => String(entry.id) === data.patient_id) ?? patient ?? null;

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

        if (selectedInvestigation && !rows[rowIndex].department_id) {
            rows[rowIndex].department_id = String(selectedInvestigation.department_id);
        }

        rows[rowIndex] = { ...rows[rowIndex], investigations: investigationsForRow };
        setData('department_rows', rows);
    };

    const addDepartmentRow = () => {
        setData('department_rows', [...data.department_rows, blankDepartmentRow()]);
    };

    const removeDepartmentRow = (rowIndex: number) => {
        if (data.department_rows.length === 1) return;
        setData(
            'department_rows',
            data.department_rows.filter((_, index) => index !== rowIndex),
        );
    };

    const addInvestigationUnderDepartment = (rowIndex: number) => {
        const rows = [...data.department_rows];
        rows[rowIndex] = {
            ...rows[rowIndex],
            investigations: [...rows[rowIndex].investigations, blankInvestigationRow()],
        };
        setData('department_rows', rows);
    };

    const removeInvestigationRow = (rowIndex: number, investigationIndex: number) => {
        const rows = [...data.department_rows];
        if (rows[rowIndex].investigations.length === 1) return;
        rows[rowIndex] = {
            ...rows[rowIndex],
            investigations: rows[rowIndex].investigations.filter((_, index) => index !== investigationIndex),
        };
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

        const payload = {
            patient_id: data.patient_id,
            billing_date: data.billing_date,
            collection_date: data.collection_date,
            report_date: data.report_date,
            sample_note: data.sample_note,
            equipment_note: data.equipment_note,
            interpretation_note: data.interpretation_note,
            items,
        };

        transform(() => payload);

        post(route('reports.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create report" />
            <form onSubmit={submit} className="space-y-6 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_id">Patient</Label>
                        <select
                            id="patient_id"
                            value={data.patient_id}
                            onChange={(event) => setData('patient_id', event.target.value)}
                            className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                        >
                            <option value="">Select patient</option>
                            {patients.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                    {entry.name} ({entry.v_id})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.patient_id} />
                    </div>
                </div>

                {selectedPatient && (
                    <div className="grid gap-2 rounded-lg border p-4 text-sm md:grid-cols-2">
                        <p>
                            <strong>Patient Name:</strong> {selectedPatient.name}
                        </p>
                        <p>
                            <strong>V.Id:</strong> {selectedPatient.v_id}
                        </p>
                        <p>
                            <strong>Age/Sex:</strong> {selectedPatient.age} Y / {selectedPatient.sex}
                        </p>
                        <p>
                            <strong>Address:</strong> {selectedPatient.address ?? '-'}
                        </p>
                        <p>
                            <strong>Referred By:</strong> {selectedPatient.referred_by ?? '-'}
                        </p>
                    </div>
                )}

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
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Departments with investigations</h3>
                        <Button type="button" variant="outline" onClick={addDepartmentRow}>
                            Add department row
                        </Button>
                    </div>
                    {data.department_rows.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className={`space-y-3 rounded-lg border-l-4 p-3 ${
                                rowIndex % 2 === 0
                                    ? 'border-l-blue-500 bg-blue-50/60 dark:border-l-blue-400 dark:bg-blue-950/25'
                                    : 'border-l-emerald-500 bg-emerald-50/60 dark:border-l-emerald-400 dark:bg-emerald-950/25'
                            }`}
                        >
                            <div className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                                Department Card #{rowIndex + 1}
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="grid flex-1 gap-1">
                                    <Label>Department row</Label>
                                    <select
                                        value={row.department_id}
                                        onChange={(e) => onDepartmentChange(rowIndex, e.target.value)}
                                        className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                                    >
                                        <option value="">Select department</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="button" variant="outline" onClick={() => removeDepartmentRow(rowIndex)}>
                                    Remove department
                                </Button>
                            </div>

                            {row.investigations.map((investigationRow, investigationIndex) => (
                                <div key={`${rowIndex}-${investigationIndex}`} className="grid gap-2 md:grid-cols-6">
                                    <select
                                        value={investigationRow.investigation_id}
                                        onChange={(e) => onInvestigationChange(rowIndex, investigationIndex, e.target.value)}
                                        className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                                    >
                                        <option value="">Select investigation</option>
                                        {investigations
                                            .filter((investigation) => !row.department_id || String(investigation.department_id) === row.department_id)
                                            .map((investigation) => (
                                                <option key={investigation.id} value={investigation.id}>
                                                    {investigation.name}
                                                </option>
                                            ))}
                                    </select>
                                    <Input
                                        placeholder="Investigation name"
                                        value={investigationRow.parameter_name}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'parameter_name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Result value"
                                        value={investigationRow.value}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'value', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Unit (auto fill)"
                                        value={investigationRow.unit}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'unit', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Interval (auto fill)"
                                        value={investigationRow.bio_ref_interval}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'bio_ref_interval', e.target.value)}
                                    />
                                    <Button type="button" variant="outline" onClick={() => removeInvestigationRow(rowIndex, investigationIndex)}>
                                        Remove row
                                    </Button>
                                </div>
                            ))}

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addInvestigationUnderDepartment(rowIndex)}
                                    disabled={!row.department_id}
                                >
                                    Add investigation row
                                </Button>
                            </div>
                        </div>
                    ))}
                    <InputError message={errors.items || errors['items.0.department_id'] || errors['items.0.investigation_id']} />
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
                        <Label htmlFor="interpretation_note">Interpretation note</Label>
                        <Input id="interpretation_note" value={data.interpretation_note} onChange={(e) => setData('interpretation_note', e.target.value)} placeholder="Please correlate with clinical conditions." />
                    </div>
                </div>

                <Button disabled={processing}>Create report</Button>
            </form>
        </AppLayout>
    );
}
