import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { produceType, currentPrice, unit, location, mode = "specific" } = body;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY_MARKET");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY_MARKET is missing in secrets");

    let prompt = "";
    
    if (mode === "general") {
      let farmerCount = 150;
      let buyerCount = 45;

      try {
        const { data: stats } = await supabaseClient.rpc('get_system_stats');
        if (stats) {
          farmerCount = stats.farmerCount || farmerCount;
          buyerCount = stats.buyerCount || buyerCount;
        }
      } catch (err) { console.warn("Using default stats"); }
      
      prompt = `Analyze Kenyan ag market for ${new Date().toLocaleString('en-US', { month: 'long' })}. 
      Context: ${farmerCount} farmers, ${buyerCount} buyers. 
      Return JSON: { "marketOverview": "...", "topPerformers": [{"name": "...", "trend": "Rising", "priceRange": "..."}], "seasonalAdvice": "...", "recommendations": [{"name": "...", "reason": "...", "timeToHarvest": "..."}] }`;
    } else {
      let stats = { avg_price: currentPrice || 50, min_price: 40, max_price: 60, total_listings: 0 };
      try {
        const { data } = await supabaseClient.rpc('get_market_averages', { p_name: produceType });
        if (data?.[0]) stats = data[0];
      } catch (err) { console.warn("Using fallback price stats"); }

      prompt = `Analyze ${produceType} in ${location || 'Kenya'}. Farmer price: ${currentPrice} per ${unit}. 
      Market stats: Avg ${stats.avg_price}, Min ${stats.min_price}, Max ${stats.max_price}.
      Return JSON: { "suggestedPriceMin": number, "suggestedPriceMax": number, "demandLevel": "High", "reasoning": "...", "pricePosition": "within" }`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + " Respond ONLY with valid JSON." }] }]
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Gemini API Error");

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON format");
    
    const guidance = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ success: true, guidance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Market Insights Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
