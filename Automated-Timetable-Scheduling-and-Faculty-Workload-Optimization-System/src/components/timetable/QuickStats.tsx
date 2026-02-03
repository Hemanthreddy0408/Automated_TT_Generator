import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  scheduledCount: number;
  conflictCount: number;
  utilizationRate: number;
  pendingChanges: number;
  className?: string;
}

export function QuickStats({
  scheduledCount,
  conflictCount,
  utilizationRate,
  pendingChanges,
  className,
}: QuickStatsProps) {
  const stats = [
    {
      label: 'Scheduled Sessions',
      value: scheduledCount,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Conflicts',
      value: conflictCount,
      icon: AlertTriangle,
      color: conflictCount > 0 ? 'text-destructive' : 'text-success',
      bgColor: conflictCount > 0 ? 'bg-destructive/10' : 'bg-success/10',
    },
    {
      label: 'Utilization',
      value: `${utilizationRate}%`,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Pending Changes',
      value: pendingChanges,
      icon: Clock,
      color: pendingChanges > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: pendingChanges > 0 ? 'bg-warning/10' : 'bg-muted',
    },
  ];

  return (
    <div className={cn('flex items-center gap-6', className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bgColor)}>
              <Icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
