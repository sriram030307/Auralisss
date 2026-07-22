import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Plus, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";

const communityAlerts = [
  { id: 1, type: "incident", icon: "🚨", title: "Chain Snatching", area: "Karol Bagh, Delhi", time: "12 min ago", reports: 3, severity: "high" },
  { id: 2, type: "hazard", icon: "⚠️", title: "Waterlogging / Road Blocked", area: "ITO Flyover, Delhi", time: "35 min ago", reports: 8, severity: "medium" },
  { id: 3, type: "accident", icon: "🚗", title: "Vehicle Accident", area: "NH48, Gurugram", time: "1 hr ago", reports: 2, severity: "high" },
  { id: 4, type: "unsafe_zone", icon: "🔴", title: "Poor Lighting Area", area: "Sector 62, Noida", time: "2 hrs ago", reports: 12, severity: "medium" },
  { id: 5, type: "alert", icon: "📢", title: "Protest / Road Block", area: "Connaught Place", time: "3 hrs ago", reports: 21, severity: "low" },
  { id: 6, type: "accident", icon: "🏍️", title: "Motorcycle Accident Prone Stretch", area: "MG Road, Gurugram", time: "1 day ago", reports: 6, severity: "high" },
];

const unsafeZones = [
  { name: "Sadar Bazar (Late Night)", risk: "High", icon: "🔴" },
  { name: "Old Delhi Station Area", risk: "Medium", icon: "🟡" },
  { name: "NH48 Night Stretch", risk: "High", icon: "🔴" },
];

const severityStyle = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default function CommunitySafety() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [reported, setReported] = useState(false);

  const filtered = filter === "all" ? communityAlerts : communityAlerts.filter(a => a.type === filter);

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Community Safety</h1>
            <p className="text-xs text-muted-foreground">Live incidents & hazard intelligence</p>
          </div>
        </div>
        <button
          onClick={() => setReported(true)}
          className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs font-semibold text-primary border border-primary/20"
        >
          <Plus className="w-3.5 h-3.5" /> Report
        </button>
      </motion.div>

      {reported && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="glass border border-green-500/30 rounded-2xl p-3 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-xs text-green-400 font-medium">Report submitted — thank you for keeping the community safe!</p>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { key: "all", label: "All" },
          { key: "incident", label: "Incidents" },
          { key: "accident", label: "Accidents" },
          { key: "hazard", label: "Hazards" },
          { key: "unsafe_zone", label: "Unsafe Zones" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === tab.key ? "bg-primary text-white" : "glass text-muted-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Community Alerts */}
      <div className="space-y-2.5">
        {filtered.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard animate={false} className="!p-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight">{alert.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${severityStyle[alert.severity]}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />{alert.area}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />{alert.reports} reports
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Unsafe Zones Summary */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Known Unsafe Zones</p>
        <div className="space-y-2">
          {unsafeZones.map((zone, i) => (
            <GlassCard key={i} animate={false} className="!p-3 flex items-center gap-3">
              <span className="text-lg">{zone.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{zone.name}</p>
                <p className="text-xs text-muted-foreground">Risk Level: {zone.risk}</p>
              </div>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}