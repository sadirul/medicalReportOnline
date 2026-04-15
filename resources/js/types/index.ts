import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: {
        status?: string;
        otp_sent?: boolean;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    uuid: string;
    name: string;
    full_name: string;
    clinic_name: string;
    mobile: string;
    address: string;
    logo?: string | null;
    alternate_mobile?: string | null;
    is_verified?: boolean;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
