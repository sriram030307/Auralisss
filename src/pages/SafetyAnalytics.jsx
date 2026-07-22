import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, AreaChart, Area
} from "recharts";
import { TrendingUp, Shield, Navigation, Clock, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";

// --- Mock data ---
const monthlyScores = [
  { week: "W1", score: 82, incidents: 0 }, { week: "W2", score: 74, incidents: 1 },
  { week: "W3", score: 88, incidents: 0 }, { week: "W4", score: 67, incidents: 2 },
];

const weeklyScores = [
  { day: "Mon", score: 88 }, { day: "Tue", score: 72 }, { day: "Wed", score: 91 },
  { day: "Thu", score: 65 }, { day: "Fri", score: 84 }, { day: "Sat", score: 76 }, { day: "Sun", score: 92 },
];

const travelData = [
  { day: "Mon", km: 12 }, { day: "Tue", km: 28 }, { day: "Wed", km: 8 },
  { day: "Thu", km: 35 }, { day: "Fri", km: 22 }, { day: "Sat", km: 5 }, { day: "Sun", km: 15 },
];

const highRiskZones = [
  { zone: "Sadar Bazar", visits: 7, riskLevel: "High", icon: "🔴", incidents: 2, lastVisit: "2 days ago" },
  { zone: "NH48 Night Stretch", visits: 5, riskLevel: "High", icon: "🔴", incidents: 1, lastVisit: "5 days ago" },
  { zone: "Old Delhi Station", visits: 4, riskLevel: "Medium", icon: "🟡", incidents: 1, lastVisit: "1 week ago" },
  { zone: "Karol Bagh Late Night", visits: 3, riskLevel: "High", icon: "🔴", incidents: 0, lastVisit: "10 days ago" },
  { zone: "Sector 62, Noida", visits: 2, riskLevel: "Medium", icon: "🟡", incidents: 0, lastVisit: "2 weeks ago" },
];

const hourlyRisk = [
  { hour: "6AM", risk: 12 }, { hour: "8AM", risk: 18 }, { hour: "10AM", risk: 10 },
  { hour: "12PM", risk: 15 }, { hour: "2PM", risk: 8 }, { hour: "4PM", risk: 20 },
  { hour: "6PM", risk: 35 }, { hour: "8PM", risk: 55 }, { hour: "10PM", risk: 78 },
  { hour: "12AM", risk: 85 }, { hour: "2AM", risk: 70 }, { hour: "4AM", risk: 45 },
];

const riskBreakdown = [
  { label: "Safe", value: 68, color: "#4ade80" },
  { label: "Caution", value: 22, color: "#fbbf24" },
  { label: "Elevated", value: 8, color: "#f97316" },
  { label: "Emergency", value: 2, color: "#f87171" },
];

const aiInsights = [
  { icon: "🌙", text: "You travel most frequently between 10PM–11PM. Consider sharing location proactively during late nights." },
  { icon: "🗺️", text: "Sadar Bazar visited 7 times this month — a high-risk zone. Plan daytime visits when possible." },
  { icon: "🔋", text: "Battery was below 15% during 2 journeys. Enable low-battery SOS to stay protected." },
  { icon: "🏃", text: "Motion patterns suggest 2 high-impact events this month. Check fall detection in Settings." },
];

const statCards = [
  { label: "Journeys Monitored", value: "23", icon: Navigation, color: "text-primary" },
  { label: "Incidents Prevented", value: "4", icon: Shield, color: "text-green-400" },
  { label: "Avg Safety Score", value: "81", icon: TrendingUp, color: "text-amber-400" },
  { label: "Hours Protected", value: "112", icon: Clock, color: "text-accent" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-border/40">
      <p className="font-bold mb-0.5">{label}</p>
      <p className="text-primary">{payload[0]?.value}{payload[0]?.name === "score" ? "/100" : payload[0]?.name === "risk" ? "% risk" : " km"}</p>
    </div>
  );
};

export default function SafetyAnalytics() {
  const navigate = useNavigate();
  const { score, status } = useSafetyEngineContext();
  const [tab] = useState("weekly");

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Safety Analytics</h1>
          <p className="text-xs text-muted-foreground">Risk trends, travel & high-risk zones</p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlassCard animate={false} className="!p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-heading font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2">
        {[
          { key: "weekly", label: "This Week" },
          { key: "monthly", label: "Monthly" },
          { key: "zones", label: "Risk Zones" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.key ? "bg-primary text-white" : "glass text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- WEEKLY TAB --- */}
      {tab === "weekly" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Daily Safety Score</p>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={weeklyScores}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[50, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "hsl(var(--primary))", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Daily Travel (km)</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={travelData} barSize={16}>
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="km" name="km" radius={[6, 6, 0, 0]}>
                  {travelData.map((_, i) => <Cell key={i} fill="hsl(var(--accent)/0.6)" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Risk by Hour of Day</p>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={hourlyRisk}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="risk" name="risk" stroke="#ef4444" strokeWidth={2} fill="url(#riskGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-1">🌙 Risk peaks between 10PM–2AM</p>
          </GlassCard>

          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Risk Distribution</p>
            <div className="space-y-2.5">
              {riskBreakdown.map((r) => (
                <div key={r.label} className="flex items-center gap-2.5">
                  <span className="text-xs w-16 text-muted-foreground">{r.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.value}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right" style={{ color: r.color }}>{r.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* --- MONTHLY TAB --- */}
      {tab === "monthly" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Monthly Risk Trend</p>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={monthlyScores}>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[50, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#monthGrad)" dot={{ fill: "hsl(var(--primary))", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Incidents per Week</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={monthlyScores} barSize={20}>
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="incidents" name="incidents" radius={[6, 6, 0, 0]}>
                  {monthlyScores.map((d, i) => <Cell key={i} fill={d.incidents > 0 ? "#ef4444" : "#4ade80"} opacity={0.7} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Monthly Summary</p>
            {[
              { label: "Total Journeys", value: "23", color: "text-primary" },
              { label: "Total Distance", value: "418 km", color: "text-accent" },
              { label: "Safe Days", value: "24 / 30", color: "text-green-400" },
              { label: "Incidents", value: "3 resolved", color: "text-amber-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      )}

      {/* --- RISK ZONES TAB --- */}
      {tab === "zones" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="!p-3 flex items-center gap-2.5 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your travel history over the past 30 days, these are your most-visited high-risk zones.
            </p>
          </GlassCard>

          {/* Bar chart of zone visits */}
          <GlassCard>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Visits to High-Risk Zones (Last 30 Days)</p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={highRiskZones.map(z => ({ name: z.zone.split(" ")[0], visits: z.visits, risk: z.riskLevel }))} barSize={18} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="glass rounded-xl px-3 py-2 text-xs border border-border/40">
                    <p className="font-bold">{label}</p>
                    <p className="text-destructive">{payload[0]?.value} visits</p>
                  </div>
                ) : null} />
                <Bar dataKey="visits" radius={[0, 6, 6, 0]}>
                  {highRiskZones.map((z, i) => (
                    <Cell key={i} fill={z.riskLevel === "High" ? "#ef4444" : "#f59e0b"} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Zone cards */}
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Zone Details</p>
            {highRiskZones.map((zone, i) => (
              <motion.div key={zone.zone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <GlassCard animate={false} className={`!p-3 flex items-center gap-3 border ${zone.riskLevel === "High" ? "border-red-500/20" : "border-amber-500/20"}`}>
                  <span className="text-xl flex-shrink-0">{zone.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{zone.zone}</p>
                    <p className="text-[10px] text-muted-foreground">{zone.visits} visits · Last: {zone.lastVisit}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${zone.riskLevel === "High" ? "text-red-400" : "text-amber-400"}`}>{zone.riskLevel}</p>
                    {zone.incidents > 0 && <p className="text-[10px] text-destructive">{zone.incidents} incident{zone.incidents > 1 ? "s" : ""}</p>}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Insights (always visible) */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">AI Recommendations</p>
        <div className="space-y-2">
          {aiInsights.map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard animate={false} className="!p-3 flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{insight.icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}