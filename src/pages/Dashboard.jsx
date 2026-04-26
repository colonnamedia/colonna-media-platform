import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Mail, Building } from "lucide-react";
import LeadProgressChart from "../components/dashboard/LeadProgressChart";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-purple-100 text-purple-700",
  closed: "bg-green-100 text-green-700",
};

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  closed: "Closed",
};

const SERVICE_LABELS = {
  photography: "Photography",
  content_creation: "Content Creation",
  consulting: "Consulting",
  customer_journey: "Customer Journey",
  web_pages: "Web Pages",
  seo: "SEO",
  ad_campaigns: "Ad Campaigns",
  lead_generation: "Lead Generation",
  other: "Other",
};

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.role === "admin") {
        const data = await base44.entities.ContactInquiry.list("-created_date", 50);
        setLeads(data);
      }
      setLoading(false);
    };
    init();
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.ContactInquiry.update(id, { status });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">This page is for admins only.</p>
        </div>
      </div>
    );
  }

  const counts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    in_progress: leads.filter((l) => l.status === "in_progress").length,
    closed: leads.filter((l) => l.status === "closed").length,
  };

  const stats = [
    { label: "New Leads", value: counts.new, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Contacted", value: counts.contacted, icon: Mail, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "In Progress", value: counts.in_progress, icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Closed", value: counts.closed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Admin</p>
          <h1 className="font-display text-4xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of leads and project statuses.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border p-6 flex items-center gap-4"
              >
                <div className={`w-12 h-12 ${stat.bg} flex items-center justify-center rounded-full`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <LeadProgressChart leads={leads} />

        {/* Leads Table */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">All Leads</h2>
            <span className="ml-auto text-xs text-muted-foreground">{leads.length} total</span>
          </div>

          {leads.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No leads yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Business</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Service</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          {lead.business_name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                        {SERVICE_LABELS[lead.service_needed] || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status || "new"}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 border-0 rounded-full cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status || "new"]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(lead.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}