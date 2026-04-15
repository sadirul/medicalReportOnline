import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    LockKeyhole,
    MailCheck,
    Palette,
    ShieldCheck,
    Smartphone,
    UserRound,
} from 'lucide-react';

export const appNavIcons = {
    dashboard: LayoutGrid,
    profile: UserRound,
    security: ShieldCheck,
} as const;

export const settingsNavIcons = {
    profile: UserRound,
    password: LockKeyhole,
    appearance: Palette,
} as const;

export const utilityNavIcons = {
    repository: FolderGit2,
    documentation: BookOpen,
} as const;

export const authIcons = {
    login: ShieldCheck,
    register: UserRound,
    verifyOtp: Smartphone,
    verifyEmail: MailCheck,
    forgotPassword: LockKeyhole,
    resetPassword: LockKeyhole,
    confirmPassword: ShieldCheck,
} as const;
