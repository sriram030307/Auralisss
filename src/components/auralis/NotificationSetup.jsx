import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { requestNotificationPermission, registerServiceWorker } from "@/lib/notifications";

export default function NotificationSetup() {
  const [show, setShow] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("auralis_permissions_dismissed");
    if (isDismissed) return;

    const notif = Notification?.permission === "granted";
    setNotifGranted(notif);

    // Check mic
    navigator.permissions?.query({ name: "microphone" }).then(() => {
      setMicGranted(true);
    }).catch(() => {});

    // Show banner if any permission not granted
    if (!notif) setShow(true);
  }, []);

  const handleGrantNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    await registerServiceWorker();
  };

  const handleGrantMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicGranted(true);
    } catch (_) {}
  };

  const dismiss = () => {
    sessionStorage.setItem("auralis_permissions_dismissed", "1");
    setShow(false);
    setDismissed(true);
  };

  if (!show || dismissed) return null;

  const allGranted = notifGranted && micGranted;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-14 left-4 right-4 z-[200] max-w-md mx-auto"
        >
          <div className="glass-strong rounded-2xl p-4 border border-primary/25 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold">Enable Full Protection</p>
              </div>
              <button onClick={dismiss} className="w-6 h-6 flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Allow the following to enable 24/7 background monitoring, voice SOS, and emergency alerts to your contacts.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleGrantNotifications}
                disabled={notifGranted}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${notifGranted ? "bg-green-500/10 border border-green-500/20" : "glass border border-amber-500/25"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notifGranted ? "bg-green-500/15" : "bg-amber-500/15"}`}>
                  {notifGranted ? <Check className="w-4 h-4 text-green-400" /> : <Bell className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <p className="text-xs font-semibold">{notifGranted ? "Notifications enabled ✓" : "Enable Notifications"}</p>
                  <p className="text-[10px] text-muted-foreground">Emergency alerts even when app is closed</p>
                </div>
              </button>

              <button
                onClick={handleGrantMic}
                disabled={micGranted}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${micGranted ? "bg-green-500/10 border border-green-500/20" : "glass border border-primary/25"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${micGranted ? "bg-green-500/15" : "bg-primary/15"}`}>
                  {micGranted ? <Check className="w-4 h-4 text-green-400" /> : <Mic className="w-4 h-4 text-primary" />}
                </div>
                <div>
                  <p className="text-xs font-semibold">{micGranted ? "Microphone enabled ✓" : "Enable Microphone"}</p>
                  <p className="text-[10px] text-muted-foreground">24/7 voice SOS — say "help" or "bachao"</p>
                </div>
              </button>
            </div>

            {allGranted && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={dismiss}
                className="w-full mt-3 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold"
              >
                ✓ All protections enabled — Close
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}