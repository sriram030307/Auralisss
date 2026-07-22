import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Battery, Shield, Home, Briefcase, GraduationCap, Plus, Phone, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";

const guardians = [
  { name: "Mom", relation: "Parent", avatar: "👩", status: "online", lastSeen: "Live", notified: true },
  { name: "Dad", relation: "Parent", avatar: "👨", status: "online", lastSeen: "2 min ago", notified: true },
  { name: "Priya", relation: "Friend", avatar: "👧", status: "away", lastSeen: "15 min ago", notified: false },
];

const geofences = [
  { label: "Home", icon: Home, address: "Sector 14, Gurgaon", active: true, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { label: "Office", icon: Briefcase, address: "Connaught Place, Delhi", active: true, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "College", icon: GraduationCap, address: "DU North Campus", active: false, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
];

export default function GuardianNetwork() {
  const navigate = useNavigate();
  const { score, status, location, batteryLevel, isJourneyActive } = useSafetyEngineContext();
  const [geofenceList, setGeofenceList] = useState(geofences);

  const toggleGeofence = (idx) => {
    setGeofenceList(prev => prev.map((g, i) => i === idx ? { ...g, active: !g.active } : g));
  };

  const statusColor = {
    Safe: "text-green-400", Caution: "text-amber-400", "Elevated Risk": "text-orange-400", Emergency: "text-red-400"
  }[status?.label] || "text-green-400";

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Guardian Network</h1>
            <p className="text-xs text-muted-foreground">Your trusted safety circle</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-primary font-semibold">Live</span>
        </div>
      </motion.div>

      {/* Live Status Card shared with guardians */}
      <GlassCard className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Your Live Status (visible to guardians)</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass rounded-xl p-3 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Safety Score</p>
              <p className={`text-sm font-bold ${statusColor}`}>{score} · {status?.label}</p>
            </div>
          </div>
          <div className="glass rounded-xl p-3 flex items-center gap-2.5">
            <Battery className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-[10px] text-muted-foreground">Battery</p>
              <p className="text-sm font-bold">{batteryLevel !== null ? `${batteryLevel}%` : "N/A"}</p>
            </div>
          </div>
          <div className="glass rounded-xl p-3 flex items-center gap-2.5 col-span-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Location</p>
              <p className="text-sm font-bold truncate">
                {location ? `${location.lat.toFixed(4)}°N, ${Math.abs(location.lng).toFixed(4)}°E` : "Acquiring..."}
              </p>
            </div>
            <div className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${isJourneyActive ? "bg-amber-500/15 text-amber-400" : "bg-green-500/15 text-green-400"}`}>
              {isJourneyActive ? "Travelling" : "Stationary"}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Guardians */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">Guardians ({guardians.length})</h3>
          <button className="w-7 h-7 glass rounded-lg flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
        <div className="space-y-2">
          {guardians.map((g, i) => (
            <motion.div key={g.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard animate={false} className="!p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">{g.avatar}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${g.status === "online" ? "bg-green-400" : "bg-amber-400"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.relation} · {g.lastSeen}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {g.notified && <Bell className="w-3.5 h-3.5 text-primary" />}
                  <a href="tel:+919876543210" className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-green-400" />
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Geofences */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">Safe Zones</h3>
          <button className="w-7 h-7 glass rounded-lg flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
        <div className="space-y-2">
          {geofenceList.map((zone, i) => {
            const Icon = zone.icon;
            return (
              <motion.div key={zone.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <GlassCard animate={false} className={`!p-3 flex items-center gap-3 border ${zone.active ? zone.bg : "border-border/30"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${zone.active ? zone.bg : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${zone.active ? zone.color : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{zone.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{zone.address}</p>
                  </div>
                  <button
                    onClick={() => toggleGeofence(i)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${zone.active ? zone.bg + " " + zone.color : "bg-muted/50 text-muted-foreground border-border/30"}`}
                  >
                    {zone.active ? "Active" : "Off"}
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Send Alert to all */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/emergency-alert")}
        className="w-full py-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Bell className="w-4 h-4" /> Alert All Guardians Now
      </motion.button>
    </div>
  );
}