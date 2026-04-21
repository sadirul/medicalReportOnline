import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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
        icon: appNavIcons.createReport,
        items: [
            {
                title: 'Create department',
                url: '/departments/create-department',
                icon: appNavIcons.createReport,
            },
            {
                title: 'All department',
                url: '/departments/all-department',
                icon: appNavIcons.allReports,
            },
        ],
    },
];

const reportsNavItems: NavItem[] = [
    {
        title: 'Reports',
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
                <NavMain items={reportsNavItems} label="Reports" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
