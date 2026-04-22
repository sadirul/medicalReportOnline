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
import { IndianRupee } from 'lucide-react';
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
    const { auth } = usePage<SharedData>().props;
    const smsBalance = Number(auth?.user?.sms_balance ?? 0);

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
            </SidebarFooter>
        </Sidebar>
    );
}
