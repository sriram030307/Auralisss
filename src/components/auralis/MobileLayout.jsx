import { useRef, useCallback } from "react";
// MobileLayout — global shell with safety engine integration
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import VoiceCommandListener from "./VoiceCommandListener";
import CrashAlert from "./CrashAlert";
import BatteryWarning from "./BatteryWarning";
import NotificationSetup from "./NotificationSetup";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";

const NO_NAV_ROUTES = ["/splash", "/onboarding", "/login", "/register", "/forgot-password", "/reset-password", "/emergency-alert"];

// Per-tab scroll position store (module-level, persists across renders)
const tabScrollPositions = {};

export default function MobileLayout() {
  const location = useLocation();
  const showNav = !NO_NAV_ROUTES.includes(location.pathname);
  const { crashDetected, fallDetected, batteryLevel, isCharging } = useSafetyEngineContext();
  const scrollRef = useRef(null);

  // Save scroll on route change, restore on arrival
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      tabScrollPositions[location.pathname] = scrollRef.current.scrollTop;
    }
  }, [location.pathname]);

  // Restore scroll position when pathname changes
  const containerRefCallback = useCallback((node) => {
    scrollRef.current = node;
    if (node) {
      node.addEventListener("scroll", handleScroll, { passive: true });
      // Restore saved position (defer one frame for content to paint)
      const saved = tabScrollPositions[location.pathname] ?? 0;
      requestAnimationFrame(() => { node.scrollTop = saved; });
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRefCallback}
      className="h-screen bg-background max-w-md mx-auto relative overflow-x-hidden overflow-y-auto"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className={showNav ? "pb-24" : ""}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
      {showNav && <VoiceCommandListener />}
      {showNav && <NotificationSetup />}
      <CrashAlert crashDetected={crashDetected} fallDetected={fallDetected} />
      <BatteryWarning batteryLevel={batteryLevel} isCharging={isCharging} />
    </div>
  );
}