import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from "react-router-dom";

import { getConstraints, toggleConstraintStatus } from '@/lib/api';
import { Constraint } from '@/types/timetable';
import {
  Plus,
  Shield,
  Building2,
  Users,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const constraintTypeConfig = {
  institutional: {
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    label: 'Institutional',
  },
  faculty: {
    icon: Users,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
    label: 'Faculty',
  },
  room: {
    icon: Building2,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    label: 'Room',
  },
  section: {
    icon: Layers,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    label: 'Section',
  },
};

const priorityConfig = {
  mandatory: {
    label: 'Mandatory',
    class: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  preferred: {
    label: 'Preferred',
    class: 'bg-warning/10 text-warning border-warning/30',
  },
  optional: {
    label: 'Optional',
    class: 'bg-muted text-muted-foreground border-border',
  },
};

export default function ConstraintsPage() {
  const navigate = useNavigate();
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getConstraints(); //
        setConstraints(data);
      } catch (err) {
        console.error("Connection to backend failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);



  const toggleConstraint = async (id: string) => {
    // Optimistic UI update
    setConstraints(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    await toggleConstraintStatus(id); //
  };
  const groupedConstraints = constraints.reduce((acc, constraint) => {
    if (!acc[constraint.type]) {
      acc[constraint.type] = [];
    }
    acc[constraint.type].push(constraint);
    return acc;
  }, {} as Record<string, Constraint[]>);

  const activeCount = constraints.filter((c) => c.isActive).length;
  const mandatoryCount = constraints.filter((c) => c.priority === 'mandatory').length;

  return (
    <AdminLayout
      title="Constraint Configuration"
      subtitle="Define scheduling rules and constraints"
      actions={
        <Button className="gap-2" onClick={() => navigate("/admin/constraints/add")}>
          <Plus className="h-4 w-4" />
          Add Constraint
        </Button>
      }

    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{constraints.length}</p>
                <p className="text-sm text-muted-foreground">Total Constraints</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mandatoryCount}</p>
                <p className="text-sm text-muted-foreground">Mandatory</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{constraints.length - activeCount}</p>
                <p className="text-sm text-muted-foreground">Disabled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Constraint Groups */}
        <div className="space-y-6">
          {Object.entries(groupedConstraints).map(([type, typeConstraints]) => {
            const config = constraintTypeConfig[type as keyof typeof constraintTypeConfig] || {
              icon: Shield,
              color: 'text-gray-600',
              bgColor: 'bg-gray-500/10',
              label: type.charAt(0).toUpperCase() + type.slice(1),
            };
            const Icon = config.icon;

            return (
              <Card key={type}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.bgColor)}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.label} Constraints</CardTitle>
                      <CardDescription>
                        {typeConstraints.length} constraint{typeConstraints.length > 1 ? 's' : ''} • {typeConstraints.filter((c) => c.isActive).length} active
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {typeConstraints.map((constraint) => {
                    const priority = priorityConfig[constraint.priority as keyof typeof priorityConfig] || {
                      label: constraint.priority,
                      class: 'bg-gray-100 text-gray-700 border-gray-300',
                    };

                    return (
                      <div
                        key={constraint.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border transition-colors',
                          constraint.isActive ? 'bg-card' : 'bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={constraint.isActive}
                            onCheckedChange={() => toggleConstraint(constraint.id)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={cn('font-medium', !constraint.isActive && 'text-muted-foreground')}>
                                {constraint.name}
                              </p>
                              <Badge variant="outline" className={cn('text-xs', priority.class)}>
                                {priority.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {constraint.description}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="border-info/50 bg-info/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 flex-shrink-0">
              <Shield className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Understanding Constraints</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Mandatory</strong> constraints must always be satisfied - the scheduler will never violate these.
                <strong> Preferred</strong> constraints are honored when possible but may be relaxed if needed.
                <strong> Optional</strong> constraints are nice-to-have and will be applied when they don't conflict with higher priority rules.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

