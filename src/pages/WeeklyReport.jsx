import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, AlertTriangle, Bell, TrendingUp, Calendar,
  ChevronDown, ChevronUp, Clock, Shield
} from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";

// Weekly summary steps (last 7 days)
function getWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return { start, end };
}

function isWithinWeek(dateStr) {
  const { start, end } = getWeekRange();
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

function groupByDay(items, dateField = "created_date") {
  const groups = {};
  items.forEach(item => {
    const d = new Date(item[dateField]);
    const key = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

export default function WeeklyReport() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    base44.entities.SafetyAlert.list("-created_date", 200)
      .then(all => setAlerts(all.filter(a => isWithinWeek(a.created_date))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const emergencyAlerts = alerts.filter(a => a.type === "sos" || a.type === "ai_alert");
  const otherAlerts = alerts.filter(a => !["sos", "ai_alert"].includes(a.type));
  const totalAlerts = alerts.length;
  const totalEmergency = emergencyAlerts.length;

  const byDay = groupByDay(alerts);

  const toggleDay = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "sos": return "🆘";
      case "ai_alert": return "🤖";
      case "check_in": return "✅";
      case "geofence": return "📍";
      case "fake_call": return "📞";
      default: return "🔔";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "sos": return "SOS Alert";
      case "ai_alert": return "AI Risk Alert";
      case "check_in": return "Check-in";
      case "geofence": return "Geofence";
      case "fake_call": return "Fake Call";
      default: return type;
    }
  };

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Weekly Report</h1>
          <p className="text-xs text-muted-foreground">
            {getWeekRange().start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {getWeekRange().end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <GlassCard animate={false} className="!p-4 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Emergency Hits</span>
                </div>
                <p className="text-3xl font-heading font-bold text-red-400">{totalEmergency}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">AI Risk Score reached EMERGENCY</p>
              </GlassCard>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard animate={false} className="!p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Alerts</span>
                </div>
                <p className="text-3xl font-heading font-bold text-amber-400">{totalAlerts}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">All types combined</p>
              </GlassCard>
            </motion.div>
          </div>

          {/* Breakdown by type */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "SOS", count: alerts.filter(a => a.type === "sos").length, icon: "🆘", color: "border-red-500/20 bg-red-500/5" },
              { label: "AI Alert", count: alerts.filter(a => a.type === "ai_alert").length, icon: "🤖", color: "border-orange-500/20 bg-orange-500/5" },
              { label: "Check-in", count: alerts.filter(a => a.type === "check_in").length, icon: "✅", color: "border-green-500/20 bg-green-500/5" },
            ].map((item) => (
              <GlassCard key={item.label} animate={false} className={`!p-3 text-center border ${item.color}`}>
                <span className="text-xl">{item.icon}</span>
                <p className="text-lg font-heading font-bold mt-1">{item.count}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Day-by-day log */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Alert Log
            </h3>
            {byDay.length === 0 ? (
              <GlassCard className="text-center !py-8">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No alerts this week</p>
                <p className="text-xs text-muted-foreground/60 mt-1">You're safe!</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {byDay.map(([day, dayAlerts]) => (
                  <GlassCard key={day} animate={false} className="!p-0 border border-border/30 overflow-hidden">
                    <button
                      onClick={() => toggleDay(day)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{day}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {dayAlerts.length} alert{dayAlerts.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      {expandedDays[day] ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedDays[day] && (
                      <div className="divide-y divide-border/30 border-t border-border/30">
                        {dayAlerts.map((alert, i) => (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="px-4 py-3"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{getTypeIcon(alert.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-xs font-semibold">{getTypeLabel(alert.type)}</p>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                    alert.status === "active" ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
                                  }`}>
                                    {alert.status}
                                  </span>
                                  {alert.type === "sos" && (
                                    <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">
                                      EMERGENCY
                                    </span>
                                  )}
                                </div>
                                {alert.message && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {new Date(alert.created_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {alert.address && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {alert.address.length > 30 ? alert.address.slice(0, 30) + "..." : alert.address}
                                    </span>
                                  )}
                                  {alert.contacts_notified?.length > 0 && (
                                    <span className="text-[10px] text-primary flex items-center gap-1">
                                      <Bell className="w-2.5 h-2.5" />
                                      {alert.contacts_notified.length} notified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* No data state if alerts exist */}
          {emergencyAlerts.length === 0 && alerts.length > 0 && (
            <GlassCard className="!p-4 border border-green-500/20 text-center">
              <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-sm text-green-400 font-semibold">No emergency alerts this week</p>
              <p className="text-xs text-muted-foreground">AI safety score stayed above emergency threshold</p>
            </GlassCard>
          )}
        </>
      )}

      <p className="text-center text-[10px] text-muted-foreground/40">
        Report auto-generated by Auralis AI Guardian
      </p>
    </div>
  );
}