import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';
import { Building2, FlaskConical, PlusCircle, Trash2 } from 'lucide-react';

type ConnectedClinic = {
    id: number;
    clinic_name: string;
    full_name: string;
    unique_clinic_id: string;
};

type Department = {
    id: number;
    name: string;
};

type Investigation = {
    id: number;
    department_id: number;
    name: string;
    unit?: string | null;
    bio_ref_interval?: string | null;
};

type InvestigationRow = {
    investigation_id: string;
    parameter_name: string;
    method: string;
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
    unit: '',
    bio_ref_interval: '',
});

const blankDepartmentRow = (): DepartmentRow => ({
    department_id: '',
    investigations: [blankInvestigationRow()],
});

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sent report', href: '/clinics/other-clinic/sent-report/create' },
];

const dateForInput = () => {
    const date = new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

export default function SentReportCreate({ connectedClinics }: { connectedClinics: ConnectedClinic[] }) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [investigations, setInvestigations] = useState<Investigation[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const { data, setData, post, transform, errors, processing } = useForm({
        receiver_user_id: '',
        patient_name: '',
        patient_age: '',
        patient_sex: '',
        patient_address: '',
        patient_referred_by: '',
        patient_whatsapp_number: '',
        billing_date: dateForInput(),
        collection_date: dateForInput(),
        report_date: dateForInput(),
        sample_note: '',
        equipment_note: '',
        interpretation_note: '',
        department_rows: [blankDepartmentRow()],
    });

    const reportErrors = errors as Record<string, string | undefined>;

    const onReceiverClinicChange = async (receiverUserId: string) => {
        setData('receiver_user_id', receiverUserId);
        setData('department_rows', [blankDepartmentRow()]);
        setDepartments([]);
        setInvestigations([]);

        if (!receiverUserId) {
            return;
        }

        setLoadingCatalog(true);
        try {
            const response = await fetch(route('clinics.sent.catalog', receiverUserId), {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Unable to load clinic catalog.');
            }

            const payload = (await response.json()) as { departments: Department[]; investigations: Investigation[] };
            setDepartments(payload.departments);
            setInvestigations(payload.investigations);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const updateInvestigationRow = (rowIndex: number, investigationIndex: number, key: keyof InvestigationRow, value: string) => {
        const rows = [...data.department_rows];
        const investigationsForRow = [...rows[rowIndex].investigations];
        investigationsForRow[investigationIndex] = { ...investigationsForRow[investigationIndex], [key]: value };
        rows[rowIndex] = { ...rows[rowIndex], investigations: investigationsForRow };
        setData('department_rows', rows);
    };

    const onDepartmentChange = (rowIndex: number, departmentId: string) => {
        const isDepartmentUsedInAnotherRow = data.department_rows.some(
            (row, index) => index !== rowIndex && row.department_id === departmentId && departmentId !== '',
        );

        if (isDepartmentUsedInAnotherRow) {
            return;
        }

        const rows = [...data.department_rows];
        rows[rowIndex] = {
            ...rows[rowIndex],
            department_id: departmentId,
            investigations: rows[rowIndex].investigations.map(() => blankInvestigationRow()),
        };
        setData('department_rows', rows);
    };

    const onInvestigationChange = (rowIndex: number, investigationIndex: number, investigationId: string) => {
        const isInvestigationUsedInAnotherRow = data.department_rows.some((row, currentRowIndex) =>
            row.investigations.some(
                (item, currentInvestigationIndex) =>
                    !(currentRowIndex === rowIndex && currentInvestigationIndex === investigationIndex) &&
                    item.investigation_id === investigationId &&
                    investigationId !== '',
            ),
        );

        if (isInvestigationUsedInAnotherRow) {
            return;
        }

        const selectedInvestigation = investigations.find((investigation) => String(investigation.id) === investigationId);
        const rows = [...data.department_rows];
        const investigationsForRow = [...rows[rowIndex].investigations];

        investigationsForRow[investigationIndex] = {
            investigation_id: investigationId,
            parameter_name: selectedInvestigation?.name ?? '',
            method: '',
            unit: selectedInvestigation?.unit ?? '',
            bio_ref_interval: selectedInvestigation?.bio_ref_interval ?? '',
        };

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

        transform(() => ({
            receiver_user_id: data.receiver_user_id,
            patient_name: data.patient_name,
            patient_age: data.patient_age,
            patient_sex: data.patient_sex,
            patient_address: data.patient_address,
            patient_referred_by: data.patient_referred_by,
            patient_whatsapp_number: data.patient_whatsapp_number,
            billing_date: data.billing_date,
            collection_date: data.collection_date,
            report_date: data.report_date,
            sample_note: data.sample_note,
            equipment_note: data.equipment_note,
            interpretation_note: data.interpretation_note,
            items,
        }));

        post(route('clinics.sent.store'), {
            preserveScroll: true,
        });
    };

    const selectedClinic = useMemo(
        () => connectedClinics.find((clinic) => String(clinic.id) === data.receiver_user_id) ?? null,
        [connectedClinics, data.receiver_user_id],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sent report" />
            <form onSubmit={submit} className="space-y-6 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="grid gap-2">
                    <Label htmlFor="receiver_user_id">Choose connected clinic</Label>
                    <select
                        id="receiver_user_id"
                        value={data.receiver_user_id}
                        onChange={(e) => onReceiverClinicChange(e.target.value)}
                        className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                    >
                        <option value="">Select clinic</option>
                        {connectedClinics.map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>
                                {clinic.clinic_name} ({clinic.unique_clinic_id})
                            </option>
                        ))}
                    </select>
                    {selectedClinic && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sending to: {selectedClinic.clinic_name} - {selectedClinic.full_name}
                        </p>
                    )}
                    <InputError message={errors.receiver_user_id} />
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
                        <InputError message={errors.patient_address} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="patient_referred_by">Referred By</Label>
                        <Input id="patient_referred_by" value={data.patient_referred_by} onChange={(e) => setData('patient_referred_by', e.target.value)} />
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
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                            <Building2 className="h-4 w-4" />
                            Departments with tests
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addDepartmentRow}
                            disabled={!data.receiver_user_id || loadingCatalog}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950/40"
                        >
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
                                    <select
                                        value={row.department_id}
                                        onChange={(e) => onDepartmentChange(rowIndex, e.target.value)}
                                        disabled={!data.receiver_user_id || loadingCatalog}
                                        className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                                    >
                                        <option value="">Select department</option>
                                        {departments.map((department) => (
                                            <option
                                                key={department.id}
                                                value={department.id}
                                                disabled={data.department_rows.some(
                                                    (otherRow, index) => index !== rowIndex && otherRow.department_id === String(department.id),
                                                )}
                                            >
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
                                <div key={`${rowIndex}-${investigationIndex}`} className="grid gap-2 md:grid-cols-5">
                                    <select
                                        value={investigationRow.investigation_id}
                                        onChange={(e) => onInvestigationChange(rowIndex, investigationIndex, e.target.value)}
                                        disabled={!row.department_id}
                                        className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900"
                                    >
                                        <option value="">{row.department_id ? 'Select test' : 'Select department first'}</option>
                                        {investigations
                                            .filter((investigation) => row.department_id && String(investigation.department_id) === row.department_id)
                                            .map((investigation) => (
                                                <option
                                                    key={investigation.id}
                                                    value={investigation.id}
                                                    disabled={data.department_rows.some((otherRow, otherRowIndex) =>
                                                        otherRow.investigations.some(
                                                            (otherInvestigation, otherInvestigationIndex) =>
                                                                !(otherRowIndex === rowIndex && otherInvestigationIndex === investigationIndex) &&
                                                                otherInvestigation.investigation_id === String(investigation.id),
                                                        ),
                                                    )}
                                                >
                                                    {investigation.name}
                                                </option>
                                            ))}
                                    </select>
                                    <Input
                                        placeholder="Test name"
                                        value={investigationRow.parameter_name}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'parameter_name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Unit"
                                        value={investigationRow.unit}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'unit', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Interval"
                                        value={investigationRow.bio_ref_interval}
                                        onChange={(e) => updateInvestigationRow(rowIndex, investigationIndex, 'bio_ref_interval', e.target.value)}
                                    />
                                    <Button type="button" variant="outline" onClick={() => removeInvestigationRow(rowIndex, investigationIndex)} className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40">
                                        <Trash2 className="mr-2 h-4 w-4" />
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
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                                >
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

                <Button disabled={processing || loadingCatalog}>Send report</Button>
            </form>
        </AppLayout>
    );
}
