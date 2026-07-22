import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navigation, AlertTriangle, CheckCircle, Square, Route, Timer, Zap, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";
import { base44 } from "@/api/base44Client";

const journeyPresets = [
  { label: "Home", icon: "🏠", eta: "20 min" },
  { label: "Office", icon: "🏢", eta: "35 min" },
  { label: "College", icon: "🎓", eta: "45 min" },
  { label: "Custom", icon: "📍", eta: "–" },
];

export default function JourneyProtection() {
  const navigate = useNavigate();
  const { isJourneyActive, location, speed, score, status, startJourney, endJourney } = useSafetyEngineContext();

  const [journey, setJourney] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [checkpoints, setCheckpoints] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [verifyCountdown, setVerifyCountdown] = useState(30);

  useEffect(() => {
    if (!journey) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [journey]);

  // Simulate anomaly detection after 3 min
  useEffect(() => {
    if (!journey) return;
    if (elapsed === 180) setShowVerification(true);
  }, [elapsed, journey]);

  useEffect(() => {
    if (!showVerification) return;
    if (verifyCountdown <= 0) {
      setShowVerification(false);
      navigate("/emergency-alert");
      return;
    }
    const t = setTimeout(() => setVerifyCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showVerification, verifyCountdown, navigate]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const speedKmh = Math.round((speed || 0) * 3.6);

  const beginJourney = (preset) => {
    startJourney();
    setJourney({ ...preset, startTime: Date.now() });
    setElapsed(0);
    setCheckpoints([{ label: "Journey Started", time: new Date().toLocaleTimeString(), ok: true }]);
    base44.entities.SafetyAlert.create({
      type: "check_in", status: "active",
      latitude: location?.lat || null, longitude: location?.lng || null,
      message: `Journey to ${preset.label} started.`,
    });
  };

  const stopJourney = () => {
    endJourney();
    setJourney(null);
    setElapsed(0);
    setCheckpoints([]);
    setShowVerification(false);
    setVerifyCountdown(30);
  };

  const riskColor = { Safe: "text-green-400", Caution: "text-amber-400", "Elevated Risk": "text-orange-400", Emergency: "text-red-400" };

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Journey Protection</h1>
          <p className="text-xs text-muted-foreground">AI-monitored travel safety</p>
        </div>
      </motion.div>

      {/* Verification Alert */}
      <AnimatePresence>
        {showVerification && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-strong border border-amber-500/40 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <p className="font-bold text-amber-400 text-sm">Safety Verification Required</p>
                <p className="text-xs text-muted-foreground">Unexpected inactivity detected. Are you safe?</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Emergency SOS will activate in <span className="text-destructive font-bold">{verifyCountdown}s</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setShowVerification(false); setVerifyCountdown(30); }}
                className="py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold">
                ✅ I'm Safe
              </button>
              <button onClick={() => navigate("/emergency-alert")}
                className="py-2.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-semibold">
                🆘 Need Help
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Journey */}
      <AnimatePresence>
        {journey ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <GlassCard className="border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold">Journey to {journey.label} {journey.icon}</span>
                </div>
                <button onClick={stopJourney} className="flex items-center gap-1 text-xs text-destructive glass px-2.5 py-1 rounded-lg">
                  <Square className="w-3 h-3" /> End
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Elapsed", value: fmt(elapsed), icon: Timer },
                  { label: "Speed", value: `${speedKmh} km/h`, icon: Zap },
                  { label: "Risk", value: status?.label || "Safe", icon: Navigation, className: riskColor[status?.label] },
                ].map(({ label, value, icon: Icon, className }) => (
                  <div key={label} className="glass rounded-xl p-2.5 text-center">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                    <p className={`text-sm font-bold ${className || ""}`}>{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Checkpoints */}
            <GlassCard>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Checkpoints</p>
              <div className="space-y-2">
                {checkpoints.map((cp, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{cp.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cp.time}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 opacity-50">
                  <Route className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">ETA: {journey.eta} (monitoring...)</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <GlassCard>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Start a Monitored Journey</p>
              <p className="text-xs text-muted-foreground mb-4">
                AI will monitor your route, detect anomalies, track ETA, and alert your guardians if you don't arrive safely.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {journeyPresets.map((preset) => (
                  <motion.button
                    key={preset.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => beginJourney(preset)}
                    className="glass rounded-xl p-3 text-left flex items-center gap-2.5 hover:border-primary/30 border border-transparent transition-all"
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{preset.label}</p>
                      <p className="text-[10px] text-muted-foreground">ETA ~{preset.eta}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* How it works */}
            <GlassCard>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">How Journey Protection Works</p>
              {[
                { icon: "📡", text: "Continuous GPS tracking with route deviation alerts" },
                { icon: "⏱️", text: "ETA monitoring — alerts guardians if overdue" },
                { icon: "🛑", text: "Unexpected stop detection with safety verification" },
                { icon: "📳", text: "Motion pattern analysis for suspicious behavior" },
                { icon: "🔔", text: "Silent escalation if you don't respond" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                  <span className="text-base">{item.icon}</span>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}