import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, PhoneOff, Volume2, User } from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";

const presetCallers = [
  { name: "Mom", avatar: "👩", number: "+1 (555) 123-4567" },
  { name: "Boss", avatar: "👔", number: "+1 (555) 987-6543" },
  { name: "Doctor", avatar: "🏥", number: "+1 (555) 456-7890" },
  { name: "Custom", avatar: "⭐", number: "Set custom caller" },
];

export default function FakeCall() {
  const navigate = useNavigate();
  const [selectedCaller, setSelectedCaller] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setCallTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  const startFakeCall = (caller) => {
    setSelectedCaller(caller);
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCallActive(true);
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const endCall = () => {
    setCallActive(false);
    setCallTimer(0);
    setSelectedCaller(null);
    clearInterval(timerRef.current);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Active call screen
  if (callActive && selectedCaller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between py-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl mb-2">
            {selectedCaller.avatar}
          </div>
          <h2 className="font-heading text-2xl font-bold">{selectedCaller.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedCaller.number}</p>
          <p className="text-primary text-sm font-medium mt-2">{formatTime(callTimer)}</p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <button className="w-14 h-14 rounded-full glass flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center glow-red"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>
          <button className="w-14 h-14 rounded-full glass flex items-center justify-center">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Countdown
  if (countdown !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm mb-4">Incoming call in</p>
          <motion.div
            key={countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-heading font-bold text-primary"
          >
            {countdown}
          </motion.div>
          <p className="text-muted-foreground text-xs mt-4">
            From: {selectedCaller?.name}
          </p>
          <button onClick={() => { setCountdown(null); setSelectedCaller(null); }} className="mt-8 text-destructive text-sm font-medium">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="px-5 pt-12 pb-4 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Fake Call</h1>
          <p className="text-xs text-muted-foreground">Escape uncomfortable situations</p>
        </div>
      </motion.div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-sm font-semibold">How it works</p>
            <p className="text-xs text-muted-foreground">
              Select a caller below. A realistic incoming call will appear after 5 seconds.
            </p>
          </div>
        </div>
      </GlassCard>

      <div>
        <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Select Caller
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {presetCallers.map((caller, i) => (
            <motion.button
              key={caller.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startFakeCall(caller)}
            >
              <GlassCard animate={false} className="text-center !p-4">
                <div className="text-3xl mb-2">{caller.avatar}</div>
                <p className="text-sm font-semibold">{caller.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{caller.number}</p>
              </GlassCard>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}