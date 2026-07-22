import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Shield, Brain, MapPin, Settings, Check, RefreshCw } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";
import usePullToRefresh from "@/hooks/usePullToRefresh";

const dummyNotifications = [
  { id: 1, type: "alert", title: "Safety Alert", message: "Unusual activity detected near your route. Stay aware of your surroundings.", time: "2 min ago", read: false },
  { id: 2, type: "safety_tip", title: "AI Safety Tip", message: "It's getting dark. Consider sharing your live location with a trusted contact.", time: "15 min ago", read: false },
  { id: 3, type: "check_in", title: "Check-in Reminder", message: "You haven't checked in for 2 hours. Your emergency contacts have been notified.", time: "1 hr ago", read: true },
  { id: 4, type: "info", title: "Safe Zone Updated", message: "Your 'Home' safe zone has been updated successfully.", time: "3 hrs ago", read: true },
  { id: 5, type: "system", title: "App Update Available", message: "Auralis v2.1 is available with improved AI detection and faster SOS activation.", time: "5 hrs ago", read: true },
  { id: 6, type: "alert", title: "Emergency Contact Added", message: "Priya has accepted your emergency contact invitation.", time: "1 day ago", read: true },
];

const iconMap = {
  alert: { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
  safety_tip: { icon: Brain, color: "text-accent", bg: "bg-accent/10" },
  check_in: { icon: MapPin, color: "text-green-400", bg: "bg-green-400/10" },
  info: { icon: Settings, color: "text-primary", bg: "bg-primary/10" },
  system: { icon: Bell, color: "text-amber-400", bg: "bg-amber-400/10" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(dummyNotifications);

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = useCallback(() =>
    new Promise(res => setTimeout(() => { setRefreshKey(k => k + 1); res(); }, 800))
  , []);

  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd, threshold } = usePullToRefresh(handleRefresh);

  return (
    <div
      className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <motion.div animate={{ height: pullY, opacity: pullY > 10 ? 1 : 0 }} transition={{ duration: 0 }} className="flex items-center justify-center overflow-hidden">
        <RefreshCw className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${(pullY / threshold) * 180}deg)` }} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-primary text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </motion.div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {notifications.map((notif, i) => {
            const config = iconMap[notif.type];
            const Icon = config.icon;
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard animate={false} className={`!p-4 flex gap-3 ${!notif.read ? "border-l-2 border-l-primary" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!notif.read ? "text-foreground" : "text-foreground/70"}`}>{notif.title}</p>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">{notif.time}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}