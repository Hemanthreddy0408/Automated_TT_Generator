import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Bell, Search } from 'lucide-react';
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
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">Leave Request Approved</span>
                    <span className="text-xs text-muted-foreground">Your request for Sep 12 was approved by Admin.</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">Schedule Generated</span>
                    <span className="text-xs text-muted-foreground">New timetable version 3 is available.</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">Room Maintenance</span>
                    <span className="text-xs text-muted-foreground">Lab-101 is closed for repairs today.</span>
                  </div>
                </DropdownMenuItem>
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
