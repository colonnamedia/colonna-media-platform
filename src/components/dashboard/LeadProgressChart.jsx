import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, parseISO, startOfMonth } from "date-fns";

export default function LeadProgressChart({ leads }) {
  const chartData = useMemo(() => {
    const monthMap = {};

    leads.forEach((lead) => {
      if (!lead.created_date) return;
      const month = format(startOfMonth(new Date(lead.created_date)), "yyyy-MM");
      if (!monthMap[month]) {
        monthMap[month] = { month, new: 0, contacted: 0, in_progress: 0, closed: 0 };
      }
      const status = lead.status || "new";
      monthMap[month][status] = (monthMap[month][status] || 0) + 1;
    });

    return Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((d) => ({ ...d, month: format(parseISO(d.month + "-01"), "MMM yyyy") }));
  }, [leads]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border p-6 mb-10">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Lead Progress by Month</h2>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
          <Bar dataKey="new" name="New" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="contacted" name="Contacted" fill="#eab308" radius={[2, 2, 0, 0]} />
          <Bar dataKey="in_progress" name="In Progress" fill="#a855f7" radius={[2, 2, 0, 0]} />
          <Bar dataKey="closed" name="Closed" fill="#22c55e" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}