import { useState, useEffect } from "react";
import { Bell, Check, Clock } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    getFacultyNotifications,
    getFacultyUnreadCount,
    markAllFacultyAsRead,
    markNotificationAsRead
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";


export function NotificationBell() {
    const facultyId = 1; // Assuming faculty 1 is logged in, matching Dashboard setup
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { count } = await getFacultyUnreadCount(facultyId);
            setUnreadCount(count);

            const data = await getFacultyNotifications(facultyId, 0, 20);
            setNotifications(data.content || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllFacultyAsRead(facultyId);
            await fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.read) {
            try {
                await markNotificationAsRead(notif.id);
                await fetchNotifications();
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative focus-visible:ring-0">
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <div
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full border-2 border-white dark:border-slate-900 bg-red-500 text-white font-bold"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-xl overflow-hidden rounded-xl border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <div className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-semibold inline-flex items-center">
                                {unreadCount} new
                            </div>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="h-8 text-[11px] text-muted-foreground hover:text-primary px-2"
                        >
                            <Check className="h-3 w-3 mr-1" /> Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                            <Bell className="h-8 w-8 mb-3 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`flex flex-col gap-1 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">
                                            {notif.title}
                                        </span>
                                        {!notif.read && (
                                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-[95%]">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center text-[10px] text-slate-400 font-medium mt-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
