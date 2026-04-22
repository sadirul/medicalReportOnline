import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { appNavIcons } from '@/lib/icon-map';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
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
        </Sidebar>
    );
}
