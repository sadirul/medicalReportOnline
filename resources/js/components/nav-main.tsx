import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[]; label?: string }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = Boolean(item.items?.length);
                    const hasActiveChild = Boolean(item.items?.some((child) => child.url === page.url));
                    const isActive = item.url === page.url || hasActiveChild;

                    if (!hasChildren) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={isActive}>
                                    <Link href={item.url} prefetch className="group">
                                        {item.icon && (
                                            <item.icon
                                                className={cn('h-4 w-4 text-muted-foreground transition-colors', isActive && 'text-foreground')}
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible key={item.title} asChild defaultOpen={hasActiveChild} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton isActive={isActive} className="group">
                                        {item.icon && <item.icon className={cn('h-4 w-4 text-muted-foreground transition-colors', isActive && 'text-foreground')} />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((child) => (
                                            <SidebarMenuSubItem key={child.title}>
                                                <SidebarMenuSubButton asChild isActive={child.url === page.url}>
                                                    <Link href={child.url} prefetch>
                                                        {child.icon && <child.icon className="h-4 w-4" />}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
