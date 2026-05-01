import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context-definition";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Configuration: 15 minutes total, warning at 14 minutes
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; 
const WARNING_TIMEOUT = 14 * 60 * 1000; 
const STORAGE_KEY = "agrilink-last-activity";

/**
 * SessionTimeoutHandler monitors user activity and automatically logs out
 * the user after a period of inactivity. It synchronizes across multiple tabs
 * using localStorage.
 */
export const SessionTimeoutHandler = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const warningToastId = useRef<string | number | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performLogout = useCallback(async () => {
    console.log("Inactivity logout triggered");
    
    // Clear any active toasts
    if (warningToastId.current) {
      toast.dismiss(warningToastId.current);
      warningToastId.current = null;
    }

    try {
      await signOut();
      toast.error("Session Expired", {
        description: "You have been logged out due to inactivity.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during inactivity logout:", error);
    }
  }, [signOut, navigate]);

  const resetTimers = useCallback((syncToStorage = true) => {
    // Clear existing timers
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    
    // Dismiss warning toast if it exists
    if (warningToastId.current) {
      toast.dismiss(warningToastId.current);
      warningToastId.current = null;
    }

    if (!user) return;

    const now = Date.now();
    
    // Update local storage to sync with other tabs if requested
    if (syncToStorage) {
      localStorage.setItem(STORAGE_KEY, now.toString());
    }

    // Set warning timer (14 minutes)
    warningTimerRef.current = setTimeout(() => {
      warningToastId.current = toast.warning("Session Expiring", {
        description: "You will be logged out in 1 minute due to inactivity.",
        duration: Infinity,
        action: {
          label: "Stay Logged In",
          onClick: () => resetTimers(true),
        },
      });
    }, WARNING_TIMEOUT);

    // Set logout timer (15 minutes)
    logoutTimerRef.current = setTimeout(() => {
      performLogout();
    }, INACTIVITY_TIMEOUT);
  }, [user, performLogout]);

  useEffect(() => {
    if (!user) return;

    // Events that count as "activity"
    const events = ["mousedown", "keydown", "scroll", "touchstart", "supabase-activity"];
    
    const handleActivity = () => {
      resetTimers(true);
    };

    // Listen for storage changes from other tabs to sync timers
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        // Reset timers but don't re-sync to storage (to avoid infinite loop)
        resetTimers(false);
      }
    };

    // Add listeners
    events.forEach((event) => window.addEventListener(event, handleActivity));
    window.addEventListener("storage", handleStorageChange);
    
    // Fallback interval to check if session expired while tab was in background/hibernated
    const checkInterval = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
      const now = Date.now();
      if (lastActivity !== 0 && now - lastActivity >= INACTIVITY_TIMEOUT) {
        performLogout();
      }
    }, 10000); // Check every 10 seconds

    // Initial timer start
    resetTimers(true);

    return () => {
      // Cleanup
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
      
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (warningToastId.current) toast.dismiss(warningToastId.current);
    };
  }, [user, resetTimers, performLogout]);

  return null;
};
