import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'metric-card group animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
            variantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>

      {/* Decorative gradient line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-1 w-full rounded-b-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100',
          variant === 'default' && 'bg-gradient-to-r from-primary to-primary/50',
          variant === 'success' && 'bg-gradient-to-r from-success to-success/50',
          variant === 'warning' && 'bg-gradient-to-r from-warning to-warning/50',
          variant === 'info' && 'bg-gradient-to-r from-info to-info/50'
        )}
      />
    </div>
  );
}
