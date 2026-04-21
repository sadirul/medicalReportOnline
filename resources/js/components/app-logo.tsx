import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { auth } = usePage<SharedData>().props;
    const fallbackLogo = '/assets/images/logo.jpeg';
    const logoSrc = auth?.user?.logo ? (auth.user.logo.startsWith('http') ? auth.user.logo : `/storage/${auth.user.logo}`) : fallbackLogo;
    const clinicName = auth?.user?.clinic_name?.trim() ? auth.user.clinic_name : 'Clinic';

    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                <img
                    src={logoSrc}
                    alt="Clinic logo"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.src = fallbackLogo;
                    }}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{clinicName}</span>
            </div>
        </>
    );
}
