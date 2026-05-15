import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useImpactStats = () => {
  const [stats, setStats] = useState({
    incomeIncrease: "40%",
    totalUsers: "0",
    reductionWaste: "30%",
    counties: "47",
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total active users (buyers + farmers)
        const { count: profilesCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        // Fetch total orders
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: 'exact', head: true });

        setStats({
          incomeIncrease: "40%",
          totalUsers: (profilesCount || 0).toString() + "+",
          reductionWaste: "30%",
          counties: "47",
          loading: false
        });
      } catch (err) {
        console.error("Error fetching impact stats:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  return stats;
};
