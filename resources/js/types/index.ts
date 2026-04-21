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
    items?: NavItem[];
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
    report_header_image?: string | null;
    report_footer_image?: string | null;
    alternate_mobile?: string | null;
    is_verified?: boolean;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Patient {
    id: number;
    name: string;
    v_id: string;
    age: number;
    sex: string;
    address?: string | null;
    referred_by?: string | null;
}

export interface Department {
    id: number;
    name: string;
    investigations?: Investigation[];
}

export interface Investigation {
    id: number;
    department_id: number;
    name: string;
    department?: Department;
    unit?: string | null;
    bio_ref_interval?: string | null;
}

export interface ReportItem {
    id: number;
    test_master_id?: number | null;
    investigation_id?: number | null;
    parameter_name: string;
    method?: string | null;
    value?: string | null;
    unit?: string | null;
    bio_ref_interval?: string | null;
    display_order: number;
}

export interface Report {
    id: number;
    patient_id: number;
    billing_date: string;
    collection_date: string;
    report_date: string;
    department?: string | null;
    sample_note?: string | null;
    equipment_note?: string | null;
    interpretation_note?: string | null;
    patient?: Patient;
    items?: ReportItem[];
}
