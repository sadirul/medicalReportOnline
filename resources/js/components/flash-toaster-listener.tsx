import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function FlashToasterListener() {
    const page = usePage<SharedData>();
    const { flash } = page.props;

    useEffect(() => {
        if (!flash?.status || flash.status.trim() === '') {
            return;
        }

        toast.dismiss('global-flash-status');
        toast.custom(
            (t) => (
                <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className={`cursor-pointer rounded-md px-4 py-2 text-left text-sm font-medium text-white shadow-lg transition-all duration-300 ${
                        t.visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                    } ${flash.status_type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}
                >
                    {flash.status}
                </button>
            ),
            {
                id: 'global-flash-status',
                duration: 4000,
                position: 'top-right',
            },
        );
    }, [page.props.flash, flash?.status, flash?.status_type]);

    return null;
}
