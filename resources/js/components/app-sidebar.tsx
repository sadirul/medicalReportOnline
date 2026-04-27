import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { appNavIcons } from '@/lib/icon-map';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { IndianRupee, MessageCircle, PhoneCall } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: appNavIcons.dashboard,
    },
    {
        title: 'Departments',
        url: '/departments/all-department',
        icon: appNavIcons.departments,
        items: [
            {
                title: 'Create department',
                url: '/departments/create-department',
                icon: appNavIcons.departments,
            },
            {
                title: 'All department',
                url: '/departments/all-department',
                icon: appNavIcons.departments,
            },
        ],
    },
];

const reportsNavItems: NavItem[] = [
    {
        title: 'My Clinic',
        url: '/reports',
        icon: appNavIcons.allReports,
        items: [
            {
                title: 'Create report',
                url: '/reports/create-report',
                icon: appNavIcons.createReport,
            },
            {
                title: 'All report',
                url: '/reports/all-report',
                icon: appNavIcons.allReports,
            },
        ],
    },
];

const otherClinicNavItems: NavItem[] = [
    {
        title: 'Other clinic',
        url: '/clinics',
        icon: appNavIcons.otherClinic,
        items: [
            {
                title: 'Add clinic',
                url: '/clinics/other-clinic',
                icon: appNavIcons.otherClinic,
            },
            {
                title: 'Sent report',
                url: '/clinics/other-clinic/sent-report/create',
                icon: appNavIcons.sentReport,
            },
            {
                title: 'Requested report',
                url: '/clinics/other-clinic/requested-report',
                icon: appNavIcons.allReports,
            },
        ],
    },
    {
        title: 'Incoming report',
        url: '/clinics/other-clinic/client-report',
        icon: appNavIcons.incomingReport,
    },
];

export function AppSidebar() {
    const { auth, name, support_contact } = usePage<SharedData>().props;
    const smsBalance = Number(auth?.user?.sms_balance ?? 0);
    const clinicName = auth?.user?.clinic_name?.trim() || auth?.user?.name?.trim() || 'my clinic';
    const supportContact = support_contact?.trim();
    const supportPhone = supportContact?.replace(/[^\d+]/g, '');
    const whatsappPhone = supportContact?.replace(/\D/g, '');
    const callHref = `tel:${supportPhone || supportContact}`;
    const whatsappMessage = encodeURIComponent(`Hi, I am from ${clinicName}. I need support with my ${name} account.`);
    const whatsappHref = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${whatsappMessage}` : undefined;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
                <NavMain items={reportsNavItems} label="My Clinic" />
                <NavMain items={otherClinicNavItems} label="Other Clinic" />
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent px-2 py-2 text-sidebar-accent-foreground">
                    <IndianRupee className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">SMS Balance: {smsBalance}</span>
                </div>
                {supportContact && (
                    <>
                        <div className="h-px bg-sidebar-border group-data-[collapsible=icon]:mx-2" />
                        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent p-2.5 text-sidebar-accent-foreground shadow-sm group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:p-2">
                            <div className="group-data-[collapsible=icon]:hidden">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                        <PhoneCall className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold leading-tight">24x7 Customer Support</p>
                                        <p className="truncate text-[11px] text-sidebar-foreground/70">{supportContact}</p>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="grid grid-cols-2 gap-2">
                                        <a
                                            href={callHref}
                                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-sidebar-primary px-2 text-xs font-semibold text-sidebar-primary-foreground transition hover:opacity-90"
                                        >
                                            <PhoneCall className="h-3.5 w-3.5" />
                                            Call
                                        </a>
                                        {whatsappHref && (
                                            <a
                                                href={whatsappHref}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <a
                                href={callHref}
                                aria-label={`Call customer support at ${supportContact}`}
                                className="hidden h-8 w-8 items-center justify-center rounded-md transition hover:bg-sidebar-border group-data-[collapsible=icon]:flex"
                            >
                                <PhoneCall className="h-4 w-4" />
                            </a>
                            {whatsappHref && (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`WhatsApp customer support at ${supportContact}`}
                                    className="hidden h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition hover:bg-sidebar-border group-data-[collapsible=icon]:flex"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
