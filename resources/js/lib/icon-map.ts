import {
    Building2,
    BookOpen,
    FilePlus2,
    Files,
    FolderGit2,
    Inbox,
    LayoutGrid,
    LockKeyhole,
    MailCheck,
    Palette,
    Send,
    ShieldCheck,
    Smartphone,
    UserRound,
} from 'lucide-react';

export const appNavIcons = {
    dashboard: LayoutGrid,
    createReport: FilePlus2,
    allReports: Files,
    departments: Building2,
    otherClinic: Building2,
    sentReport: Send,
    incomingReport: Inbox,
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
