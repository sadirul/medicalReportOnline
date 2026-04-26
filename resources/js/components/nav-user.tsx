import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, FileText } from 'lucide-react';

export function NavUser() {
    const { auth, notifications } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const unreadCount = notifications?.unread_count ?? 0;
    const notificationItems = notifications?.items ?? [];

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-sidebar-accent">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-none text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="end" side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}>
                    <div className="flex items-center justify-between px-3 py-2">
                        <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                            <Link as="button" method="post" href={route('notifications.read-all')} className="text-xs text-blue-600 hover:underline">
                                Mark all as read
                            </Link>
                        )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-auto p-1">
                        {notificationItems.length === 0 && <p className="px-2 py-6 text-center text-sm text-neutral-500">No notifications yet.</p>}
                        {notificationItems.map((notification) => {
                            const actorLogo = notification.actor_logo
                                ? notification.actor_logo.startsWith('http') || notification.actor_logo.startsWith('/')
                                    ? notification.actor_logo
                                    : `/storage/${notification.actor_logo}`
                                : null;

                            return (
                                <Link
                                    key={notification.id}
                                    as="button"
                                    method="post"
                                    href={route('notifications.read', notification.id)}
                                    className={cn(
                                        'flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                        notification.read_at === null && 'bg-blue-50/60 dark:bg-blue-950/20',
                                    )}
                                >
                                    {notification.icon_type === 'report' ? (
                                        <span className="mt-0.5 rounded-md bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                            <FileText className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <Avatar className="mt-0.5 h-8 w-8">
                                            <AvatarImage src={actorLogo ?? undefined} alt={notification.actor_name || 'Notification'} />
                                            <AvatarFallback className="text-xs">
                                                {notification.actor_initials || getInitials(notification.actor_name || 'SC')}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{notification.title}</p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-300">{notification.message}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                                <UserInfo user={auth.user} />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    );
}
