import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";

// Silently send distress message to all emergency contacts
async function sendDistressMessages(location) {
  let contacts = [];
  try {
    contacts = await base44.entities.EmergencyContact.list();
  } catch {
    contacts = [];
  }

  const locationText = location
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : "Location unavailable";

  const message = `🆘 EMERGENCY ALERT from Auralis Safety App\n\nI may be in danger. My current location:\n${locationText}\n\nPlease call me or contact emergency services immediately.\n\nSent automatically by Auralis AI Guardian.`;

  // Log the distress alert in SafetyAlert entity (silent background)
  try {
    await base44.entities.SafetyAlert.create({
      type: "sos",
      status: "active",
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      address: location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : null,
      message,
      contacts_notified: contacts.map(c => c.name),
    });
  } catch {}
}

export default function SOSButton() {
  const [, setPressing] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const navigate = useNavigate();
  const { location } = useSafetyEngineContext();
  const intervalRef = useRef(null);

  const handlePressStart = () => {
    setPressing(true);
    setProgressVal(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 2;
      setProgressVal(p);
      if (p >= 100) {
        clearInterval(intervalRef.current);
        // Silently send distress messages in background, then navigate
        sendDistressMessages(location).catch(() => {});
        navigate("/emergency-alert");
      }
    }, 30);
  };

  const handlePressEnd = () => {
    setPressing(false);
    setProgressVal(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-44 h-44 rounded-full border border-destructive/20 ring-pulse-1 absolute" />
        <div className="w-44 h-44 rounded-full border border-destructive/15 ring-pulse-2 absolute" />
        <div className="w-44 h-44 rounded-full border border-destructive/10 ring-pulse-3 absolute" />
      </div>

      {/* Progress ring */}
      <svg className="absolute w-48 h-48" viewBox="0 0 192 192">
        <circle
          cx="96" cy="96" r="88"
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="3"
          strokeDasharray={553}
          strokeDashoffset={553 - (553 * progressVal) / 100}
          strokeLinecap="round"
          className="transition-all duration-100"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>

      {/* Button */}
      <motion.button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-destructive to-red-700 flex flex-col items-center justify-center gap-1 sos-pulse cursor-pointer select-none"
      >
        <ShieldAlert className="w-10 h-10 text-white" />
        <span className="text-white font-heading font-bold text-lg tracking-wider">SOS</span>
        <span className="text-white/70 text-[9px] font-medium">HOLD TO ACTIVATE</span>
      </motion.button>
    </div>
  );
}