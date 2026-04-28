import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search } from 'lucide-react';
import { KeyboardEvent, useMemo, useState } from 'react';

export type DoctorOption = {
    id: number;
    name: string;
    mobile: string;
    email?: string | null;
    hospital: string;
};

type DoctorComboboxProps = {
    doctors: DoctorOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

const doctorDisplayName = (doctor: DoctorOption) => `${doctor.name}${doctor.hospital ? `, ${doctor.hospital}` : ''}`;

export function DoctorCombobox({ doctors, value, onChange, disabled = false }: DoctorComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const filteredDoctors = useMemo(() => {
        const query = search.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const haystack = `${doctor.name} ${doctor.mobile} ${doctor.email ?? ''} ${doctor.hospital}`.toLowerCase();
            return query === '' || haystack.includes(query);
        });
    }, [doctors, search]);

    const activeDoctor = filteredDoctors[Math.min(activeIndex, Math.max(filteredDoctors.length - 1, 0))];

    const selectDoctor = (doctor: DoctorOption) => {
        onChange(doctorDisplayName(doctor));
        setSearch('');
        setActiveIndex(0);
        setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => (filteredDoctors.length === 0 ? 0 : Math.min(index + 1, filteredDoctors.length - 1)));
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            if (activeDoctor) {
                selectDoctor(activeDoctor);
            }
            return;
        }

        if (event.key === 'Delete') {
            event.preventDefault();
            setSearch('');
            setActiveIndex(0);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((current) => !current);
                    setActiveIndex(0);
                }}
                disabled={disabled}
                className="flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
                <span className="truncate">{value || 'Select doctor'}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            autoFocus
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setActiveIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search doctor"
                            className="pl-9"
                        />
                    </div>
                    <div className="mt-2 max-h-64 overflow-y-auto">
                        {filteredDoctors.length === 0 && <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No doctors found.</div>}
                        {filteredDoctors.map((doctor, index) => {
                            const isActive = index === activeIndex;

                            return (
                                <button
                                    key={doctor.id}
                                    type="button"
                                    onClick={() => selectDoctor(doctor)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                                        isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                    }`}
                                >
                                    <span className="block truncate font-medium">{doctor.name}</span>
                                    <span className="block truncate text-xs opacity-80">
                                        {doctor.hospital} · {doctor.mobile}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {value && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onChange('');
                                setSearch('');
                                setOpen(false);
                            }}
                            className="mt-2 w-full"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
