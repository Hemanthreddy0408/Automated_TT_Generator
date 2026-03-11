import { ReactNode, useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Bell, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead
} from '@/lib/api';
import { NotificationDTO } from '@/types/timetable';
import { formatDistanceToNow } from 'date-fns';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminLayout({ children, title, subtitle, actions, breadcrumbs }: AdminLayoutProps) {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const notes = await getAdminNotifications();
      setNotifications(notes);
      const count = await getAdminUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAdminNotificationAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAdminNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="pl-64 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <div>
              {breadcrumbs && (
                <nav className="flex items-center text-xs text-muted-foreground mb-1">
                  {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <span className="mx-2 text-muted-foreground/50">/</span>}
                      {item.href ? (
                        <a href={item.href} className="hover:text-foreground transition-colors">
                          {item.label}
                        </a>
                      ) : (
                        <span className={item.active ? "text-foreground font-medium" : ""}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  ))}
                </nav>
              )}
              <h1 className="text-xl font-semibold text-foreground leading-none">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                onChange={(e) => console.log("Searching:", e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="notifications-trigger">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <a
                      role="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Mark all read
                    </a>
                  )}
                </div>
                <DropdownMenuSeparator />

                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((note) => (
                      <DropdownMenuItem
                        key={note.id}
                        className={`cursor-pointer py-3 ${note.read ? 'opacity-60' : 'bg-primary/5'}`}
                        onClick={() => {
                          if (!note.read) handleMarkAsRead(note.id);
                        }}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-semibold text-sm ${note.read ? '' : 'text-primary'}`}>
                              {note.title}
                            </span>
                            {!note.read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {note.message}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 mt-1">
                            {note.createdAt ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {actions}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
