import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  TrendingUp,
  CheckCircle,
  BarChart3,
  Bell,
  Moon,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AdminLayout
      title="Analytics & Optimization Insights"
      subtitle="Monitor scheduling health and faculty performance"
    >
      <div className="space-y-8">

        {/* ===================== KPI CARDS ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title="Overall Schedule Quality"
            value="94.8%"
            trend="+4.2%"
            color="blue"
          />

          <KpiCard
            title="Workload Balance Score"
            value="88.2"
            badge="Optimized"
            color="purple"
          />

          <KpiCard
            title="Room Utilization"
            value="76.4%"
            subtitle="Average daily"
            color="orange"
          />
        </div>

        {/* ===================== FACULTY WORKLOAD ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* BAR CHART */}
          <div className="lg:col-span-2 bg-card border rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold">Faculty Workload Fairness</h3>
                <p className="text-sm text-muted-foreground">
                  Distribution of teaching hours
                </p>
              </div>

              <select className="text-sm rounded-lg border px-3 py-1">
                <option>This Week</option>
                <option>Current Semester</option>
              </select>
            </div>

            <div className="flex items-end gap-4 h-64 border-b pb-2">
              {[
                "Dr. Sarah M.",
                "Dr. James C.",
                "Prof. Emily W.",
                "Dr. Michael B.",
                "Dr. Lisa P.",
                "Prof. David R.",
              ].map((name, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-primary/20 rounded-t-lg h-[80%] relative">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-[60%]" />
                  </div>
                  <span className="text-[10px] mt-2 text-muted-foreground text-center truncate">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6 pt-4 text-xs text-muted-foreground">
              <Legend label="Core Hours" />
              <Legend label="Lab / Elective Hours" faded />
            </div>
          </div>

          {/* CONFLICT TRENDS */}
          <div className="bg-card border rounded-2xl p-8">
            <h3 className="text-lg font-bold">Conflict Trends</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Weekly conflict occurrences
            </p>

            <div className="h-40 bg-red-500/10 rounded-xl flex items-end p-4">
              <div className="w-full h-full border-b border-muted" />
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <TrendRow label="Current Rate" value="12 Conflicts" color="red" />
              <TrendRow label="Monthly Avg" value="42 Conflicts" />
            </div>
          </div>
        </div>

        {/* ===================== HEATMAP ===================== */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">
                Curriculum Completion Heatmap
              </h3>
              <p className="text-sm text-muted-foreground">
                Scheduled sessions by department
              </p>
            </div>

            <button className="px-4 py-2 text-sm rounded-lg border">
              Export Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-3 text-left">Department</th>
                  <th className="text-center">Year 1</th>
                  <th className="text-center">Year 2</th>
                  <th className="text-center">Year 3</th>
                  <th className="text-center">Year 4</th>
                  <th className="text-right">Avg</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Computer Science", 100, 94, 100, 82, "94.0%"],
                  ["Electrical Engg", 88, 96, 65, 92, "85.2%"],
                  ["Mechanical Engg", 98, 100, 95, 91, "96.0%"],
                  ["Business Admin", 68, 75, 42, 70, "63.7%"],
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 font-medium">{row[0]}</td>
                    {[1, 2, 3, 4].map((idx) => (
                      <td key={idx} className="text-center py-4">
                        <HeatCell value={row[idx] as number} />
                      </td>
                    ))}
                    <td className="text-right font-bold text-primary">
                      {row[5]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

/* ===================== COMPONENTS ===================== */

function KpiCard({
  title,
  value,
  trend,
  badge,
  subtitle,
}: {
  title: string;
  value: string;
  trend?: string;
  badge?: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-card border rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <BarChart3 className="text-primary" />
        {trend && (
          <span className="text-xs text-emerald-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
        {badge && (
          <span className="text-xs text-emerald-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

function Legend({ label, faded }: { label: string; faded?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          faded ? "bg-primary/20" : "bg-primary"
        }`}
      />
      {label}
    </div>
  );
}

function TrendRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${color === "red" ? "text-red-500" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function HeatCell({ value }: { value: number }) {
  return (
    <div
      className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor: `rgba(16,185,129,${value / 100})` }}
    >
      {value}%
    </div>
  );
}
