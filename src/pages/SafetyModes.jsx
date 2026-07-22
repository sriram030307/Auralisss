import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronRight, Check, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";

const modes = [
  {
    id: "women",
    icon: "👩",
    label: "Women Safety Mode",
    description: "Enhanced monitoring after 8PM, auto-shares location with trusted contacts, panic phrase detection, silent SOS.",
    features: ["Auto-location sharing after 8PM", "Enhanced voice phrase detection", "Silent SOS without screen interaction", "Quick access to 1091 Women Helpline"],
    color: "from-pink-500/20 to-purple-500/10",
    border: "border-pink-500/25",
    badge: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
  {
    id: "student",
    icon: "🎓",
    label: "Student Safety Mode",
    description: "Campus geofencing, auto check-ins at class times, late-night travel alerts, and parent notification.",
    features: ["Campus geofence monitoring", "Scheduled check-in reminders", "Late-night travel escalation", "Parent guardian alerts"],
    color: "from-blue-500/20 to-indigo-500/10",
    border: "border-blue-500/25",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "elderly",
    icon: "👴",
    label: "Elderly Protection Mode",
    description: "Fall detection enabled at max sensitivity, inactivity monitoring, medication reminders, and caregiver alerts.",
    features: ["High-sensitivity fall detection", "30-min inactivity alerts", "Caregiver notification system", "Simplified emergency interface"],
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/25",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "child",
    icon: "🧒",
    label: "Child Monitoring Mode",
    description: "School geofence alerts, arrival/departure notifications, location sharing with parents, panic button.",
    features: ["School zone geofencing", "Arrival/departure alerts to parents", "Continuous location for parents", "One-tap SOS to parents"],
    color: "from-green-500/20 to-teal-500/10",
    border: "border-green-500/25",
    badge: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    id: "night",
    icon: "🌙",
    label: "Night Travel Mode",
    description: "Activates automatically after 10PM. Increased check-in frequency, route monitoring, taxi safety features.",
    features: ["Auto-activates 10PM–5AM", "15-min check-in intervals", "Cab number & route logging", "Bright SOS screen flash"],
    color: "from-indigo-500/20 to-violet-500/10",
    border: "border-indigo-500/25",
    badge: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
];

export default function SafetyModes() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const toggleMode = (id) => setActiveMode(prev => prev === id ? null : id);

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Safety Modes</h1>
          <p className="text-xs text-muted-foreground">Adaptive monitoring for every situation</p>
        </div>
      </motion.div>

      {/* Active Mode Banner */}
      {activeMode && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-strong border border-primary/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Active Mode</p>
            <p className="text-sm font-bold">{modes.find(m => m.id === activeMode)?.label}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </motion.div>
      )}

      {/* Mode Cards */}
      <div className="space-y-3">
        {modes.map((mode, i) => {
          const isActive = activeMode === mode.id;
          const isExpanded = expanded === mode.id;
          return (
            <motion.div key={mode.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlassCard animate={false} className={`!p-0 overflow-hidden border ${isActive ? mode.border : "border-border/30"}`}>
                <div className={`p-4 bg-gradient-to-r ${isActive ? mode.color : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{mode.label}</p>
                        {isActive && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mode.badge}`}>Active</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{mode.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleMode(mode.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive ? "bg-primary text-white" : "glass border border-border/40 text-foreground"
                      }`}
                    >
                      {isActive ? "✓ Deactivate" : "Activate"}
                    </motion.button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : mode.id)}
                      className="w-8 h-8 glass rounded-lg flex items-center justify-center"
                    >
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-4 pb-4 border-t border-border/30 pt-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Features</p>
                    <div className="space-y-1.5">
                      {mode.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">{f}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}