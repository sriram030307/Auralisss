import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone, MapPin, Users, Zap, RefreshCw, LayoutGrid,
  Shield, Navigation, Activity, AlertTriangle, Route,
  Siren, TrendingUp, FileText, Radio
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";
import GlassCard from "@/components/auralis/GlassCard";
import SOSButton from "@/components/auralis/SOSButton";
import QuickAction from "@/components/auralis/QuickAction";
import RiskScoreBadge from "@/components/auralis/RiskScoreBadge";
import GuardianMenu from "@/components/auralis/GuardianMenu";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { Battery } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { score, status, batteryLevel, isJourneyActive, speed } = useSafetyEngineContext();
  const [greeting, setGreeting] = useState("Hello");
  const [guardianMenuOpen, setGuardianMenuOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleRefresh = useCallback(() =>
    new Promise(res => setTimeout(() => { res(); }, 800))
  , []);

  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd, threshold } = usePullToRefresh(handleRefresh);

  const firstName = user?.full_name?.split(" ")[0] || "User";
  const speedKmh = Math.round((speed || 0) * 3.6);

  const statusColor = {
    Safe: "text-green-400", Caution: "text-amber-400", "Elevated Risk": "text-orange-400", Emergency: "text-red-400"
  }[status?.label] || "text-green-400";

  return (
    <div
      className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <motion.div
        animate={{ height: pullY, opacity: pullY > 10 ? 1 : 0 }}
        transition={{ duration: 0 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <RefreshCw className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${(pullY / threshold) * 180}deg)` }}
        />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-muted-foreground text-sm">{greeting}</p>
          <h1 className="font-heading text-2xl font-bold">{firstName}</h1>
        </div>
        <button
          onClick={() => setGuardianMenuOpen(true)}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-primary/20"
        >
          <LayoutGrid className="w-5 h-5 text-primary" />
        </button>
      </motion.div>

      {/* Live AI Risk Score */}
      <RiskScoreBadge score={score} status={status} />

      {/* Live Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard animate={false} className="!p-3 text-center">
          <Navigation className={`w-5 h-5 mx-auto mb-1 ${isJourneyActive ? "text-amber-400" : "text-muted-foreground"}`} />
          <p className={`text-sm font-bold ${isJourneyActive ? "text-amber-400" : "text-muted-foreground"}`}>
            {isJourneyActive ? `${speedKmh}km/h` : "Still"}
          </p>
          <p className="text-[10px] text-muted-foreground">Journey</p>
        </GlassCard>
        <GlassCard animate={false} className="!p-3 text-center">
          <Battery className={`w-5 h-5 mx-auto mb-1 ${batteryLevel !== null && batteryLevel < 20 ? "text-amber-400" : "text-green-400"}`} />
          <p className={`text-sm font-bold ${batteryLevel !== null && batteryLevel < 20 ? "text-amber-400" : "text-green-400"}`}>
            {batteryLevel !== null ? `${batteryLevel}%` : "–"}
          </p>
          <p className="text-[10px] text-muted-foreground">Battery</p>
        </GlassCard>
        <GlassCard animate={false} className="!p-3 text-center">
          <Activity className={`w-5 h-5 mx-auto mb-1 ${statusColor}`} />
          <p className={`text-sm font-bold ${statusColor}`}>{status?.label || "Safe"}</p>
          <p className="text-[10px] text-muted-foreground">Status</p>
        </GlassCard>
      </div>

      {/* SOS Button */}
      <SOSButton />

      {/* Emergency Numbers */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">🇮🇳 Emergency Numbers</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Police", num: "100", emoji: "🚔", color: "from-blue-600/20 to-blue-600/5 border-blue-500/20" },
            { label: "Ambulance", num: "108", emoji: "🚑", color: "from-red-600/20 to-red-600/5 border-red-500/20" },
            { label: "Fire", num: "101", emoji: "🚒", color: "from-amber-600/20 to-amber-600/5 border-amber-500/20" },
            { label: "Women", num: "1091", emoji: "🆘", color: "from-purple-600/20 to-purple-600/5 border-purple-500/20" },
          ].map((e) => (
            <motion.a
              key={e.num}
              href={`tel:${e.num}`}
              whileTap={{ scale: 0.93 }}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-gradient-to-b ${e.color} border glass`}
            >
              <span className="text-xl">{e.emoji}</span>
              <span className="text-[10px] text-muted-foreground">{e.label}</span>
              <span className="text-xs font-bold">{e.num}</span>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Quick Actions — 4 primary */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Phone} label="Fake Call" color="amber" onClick={() => navigate("/fake-call")} />
          <QuickAction icon={MapPin} label="Live Map" color="green" onClick={() => navigate("/map")} />
          <QuickAction icon={Users} label="Contacts" color="primary" onClick={() => navigate("/profile")} />
          <QuickAction icon={Zap} label="AI Chat" color="secondary" onClick={() => navigate("/chat")} />
        </div>
      </div>

      {/* Safety Feature Grid */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Safety Features</h3>
        <div className="grid grid-cols-3 gap-2.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/journey")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-amber-500/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Route className="w-5 h-5 text-amber-400" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-amber-400">Journey</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/guardian")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-primary/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-primary">Guardian</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/analytics")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-violet-500/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-violet-400">Analytics</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/incidents")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-red-500/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-red-400">Incidents</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/modes")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-green-500/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center">
              <Radio className="w-5 h-5 text-green-400" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-green-400">Modes</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/community")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-orange-500/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Siren className="w-5 h-5 text-orange-400" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-orange-400">Community</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/weekly-report")}
            className="glass rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-cyan-500/20 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-cyan-400">Report</span>
          </motion.button>
        </div>
      </div>

      {/* Guardian Hub */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setGuardianMenuOpen(true)}
        className="w-full glass rounded-2xl p-4 flex items-center gap-3 border border-primary/20 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Guardian Hub</p>
          <p className="text-xs text-muted-foreground">All safety modules in one place</p>
        </div>
        <Navigation className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      <GuardianMenu open={guardianMenuOpen} onClose={() => setGuardianMenuOpen(false)} />
    </div>
  );
}