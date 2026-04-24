import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { Link, useForm, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { ReactNode } from 'react';

interface SuperadminLayoutProps {
    title: string;
    children: ReactNode;
}

export default function SuperadminLayout({ title, children }: SuperadminLayoutProps) {
    const { post, processing } = useForm({});
    const page = usePage<{ auth?: { user?: { name?: string; login_id?: string } } }>();
    const { auth } = page.props;
    const url = String(page.url ?? '');
    const authUser = auth?.user;
    const displayName = authUser?.name ?? 'Superadmin';
    const initials = displayName
        .split(' ')
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const navItems = [
        { label: 'Dashboard', href: route('superadmin.dashboard'), icon: LayoutDashboard, active: url === '/superadmin' },
        { label: 'Clinics', href: route('superadmin.clinics.index'), icon: Users, active: url.startsWith('/superadmin/clinics') },
    ];

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={route('superadmin.dashboard')}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">Superadmin</span>
                                        <span className="text-xs text-muted-foreground">{title}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

            </Sidebar>

            <AppContent variant="sidebar">
                <header className="border-sidebar-border/50 bg-card/80 flex h-16 shrink-0 items-center border-b px-4 backdrop-blur-sm">
                    <SidebarTrigger className="-ml-1 mr-2" />
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 px-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('superadmin.password.edit')} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => {
                                        post(route('superadmin.logout'));
                                    }}
                                    disabled={processing}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex h-full flex-1 flex-col gap-4 rounded-xl bg-slate-50/60 p-4 dark:bg-slate-950/50">{children}</main>
            </AppContent>
        </AppShell>
    );
}
