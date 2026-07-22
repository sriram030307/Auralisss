import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

const config = {
  Safe:          { icon: ShieldCheck, bg: "bg-green-500/15",  border: "border-green-500/30",  text: "text-green-400",  ring: "shadow-green-500/20" },
  Caution:       { icon: AlertTriangle, bg: "bg-amber-500/15", border: "border-amber-500/30",  text: "text-amber-400",  ring: "shadow-amber-500/20" },
  "Elevated Risk": { icon: ShieldAlert, bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400", ring: "shadow-orange-500/20" },
  Emergency:     { icon: ShieldAlert, bg: "bg-red-500/20",    border: "border-red-500/40",    text: "text-red-400",    ring: "shadow-red-500/30" },
};

export default function RiskScoreBadge({ score, status, compact = false }) {
  const cfg = config[status?.label] || config["Safe"];
  const Icon = cfg.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border ${cfg.border}`}>
        <Icon className={`w-3 h-3 ${cfg.text}`} />
        <span className={`text-xs font-semibold ${cfg.text}`}>{status?.label}</span>
      </div>
    );
  }

  return (
    <motion.div
      key={score}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass border ${cfg.border} shadow-lg ${cfg.ring}`}
    >
      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${cfg.text}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">AI Risk Score</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-heading font-black ${cfg.text}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
          <span className={`text-xs font-semibold ml-1 ${cfg.text}`}>· {status?.label}</span>
        </div>
      </div>
    </motion.div>
  );
}