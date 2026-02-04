import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Calendar,
  Users,
  Building2,
  Shield,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered timetable generation with conflict-free guarantees',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: 'Constraint Engine',
    description: 'Define complex rules that are always respected',
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
  },
  {
    icon: Zap,
    title: 'Real-time Optimization',
    description: 'Automatic rebalancing when changes occur',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Insights into utilization, conflicts, and workload',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

const stats = [
  { value: '99.9%', label: 'Conflict-Free Rate' },
  { value: '78%', label: 'Avg. Room Utilization' },
  { value: '< 2min', label: 'Generation Time' },
  { value: '24/7', label: 'System Availability' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AcadSchedule</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/faculty">
              <Button variant="ghost">Faculty Portal</Button>
            </Link>
            <Link to="/admin">
              <Button className="gap-2">
                Admin Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Intelligent Academic Scheduling
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Academic Timetable{' '}
              <span className="text-gradient">Management System</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              A smart, constraint-aware scheduling platform that automatically creates, 
              optimizes, and manages academic schedules with zero conflicts and complete transparency.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/admin">
                <Button size="lg" className="gap-2 px-8">
                  <Calendar className="h-5 w-5" />
                  Open Admin Dashboard
                </Button>
              </Link>
              <Link to="/faculty">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <Users className="h-5 w-5" />
                  Faculty Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-card border shadow-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Everything you need to manage complex academic schedules efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="card-hover border-0 shadow-sm">
                  <CardHeader>
                    <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', feature.bgColor)}>
                      <Icon className={cn('h-6 w-6', feature.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Built for Modern Universities</h2>
              <p className="text-muted-foreground mb-8">
                Our system handles the complexity of academic scheduling with ease, 
                ensuring optimal resource utilization and zero scheduling conflicts.
              </p>

              <div className="space-y-4">
                {[
                  'Automatic conflict detection and resolution',
                  'Faculty workload balancing',
                  'Room capacity and equipment matching',
                  'Elective alignment across sections',
                  'Real-time schedule adjustments',
                  'Complete audit trail and history',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-primary" />
                <p className="text-2xl font-bold">6+</p>
                <p className="text-sm text-muted-foreground">Subject Types</p>
              </Card>
              <Card className="p-6 text-center">
                <Users className="h-10 w-10 mx-auto mb-3 text-info" />
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-muted-foreground">Faculty Members</p>
              </Card>
              <Card className="p-6 text-center">
                <Building2 className="h-10 w-10 mx-auto mb-3 text-success" />
                <p className="text-2xl font-bold">20+</p>
                <p className="text-sm text-muted-foreground">Rooms & Labs</p>
              </Card>
              <Card className="p-6 text-center">
                <Layers className="h-10 w-10 mx-auto mb-3 text-warning" />
                <p className="text-2xl font-bold">100+</p>
                <p className="text-sm text-muted-foreground">Weekly Sessions</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Scheduling?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Start managing your academic timetables with intelligence and ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/admin">
              <Button size="lg" variant="secondary" className="gap-2 px-8">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AcadSchedule</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Academic Timetable Management System. Built for modern universities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
