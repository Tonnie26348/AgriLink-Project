import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { produceType, currentPrice, unit, location, mode = "specific" } = body;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY_MARKET");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY_MARKET is missing");
      throw new Error("API configuration error: Market key missing");
    }

    let prompt = "";
    
    if (mode === "general") {
      let farmerCount = 10000;
      let buyerCount = 2800;

      try {
        const { data: topStats, error: rpcError } = await supabaseClient.rpc('get_system_stats');
        if (!rpcError && topStats) {
          farmerCount = topStats.farmerCount || farmerCount;
          buyerCount = topStats.buyerCount || buyerCount;
        } else if (rpcError) {
          console.warn("RPC Error (get_system_stats):", rpcError.message);
        }
      } catch (err) {
        console.warn("Failed to fetch system stats:", err);
      }
      
      prompt = `You are an expert AgriLink Market & Agricultural Consultant specializing in Kenya.
Analyze the current Kenyan agricultural market for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
Platform Context: ${farmerCount}+ farmers, ${buyerCount}+ buyers.

Tasks:
1. Provide a market overview.
2. Identify top performing crops.
3. Provide seasonal advice.
4. Suggest a demand heatmap by region.
5. RECOMMEND the top 3 crops to plant RIGHT NOW based on predicted demand in 3-4 months.

Return a JSON object exactly like this:
{
  "marketOverview": "1-2 sentences summarizing current trends in Kenya",
  "topPerformers": [
    { "name": "Crop Name", "trend": "Rising" | "Stable" | "Falling", "priceRange": "Ksh XX - YY" }
  ],
  "seasonalAdvice": "Specific actionable advice for this month",
  "demandHeatmap": [
    { "region": "Region Name", "level": number (1-100), "topCrops": ["Crop1", "Crop2"] }
  ],
  "recommendations": [
    { "name": "Crop Name", "reason": "Why it's recommended", "timeToHarvest": "months" }
  ]
}`;
    } else {
      let stats = { avg_price: currentPrice || 50, min_price: currentPrice || 40, max_price: currentPrice || 60, total_listings: 0 };
      
      try {
        const { data: marketData, error: rpcError } = await supabaseClient.rpc('get_market_averages', { 
          p_name: produceType 
        });
        if (!rpcError && marketData?.[0]) {
          stats = marketData[0];
        } else if (rpcError) {
          console.warn("RPC Error (get_market_averages):", rpcError.message);
        }
      } catch (err) {
        console.warn("Database error fetching averages:", err);
      }

      prompt = `You are an AgriLink Market Analyst.
Analyze this for a farmer in ${location || 'Kenya'}:
- Produce: ${produceType}
- Farmer's Price: ${currentPrice || 'Market'} per ${unit || 'kg'}
- Marketplace Stats: Avg ${stats.avg_price}, Min ${stats.min_price}, Max ${stats.max_price} from ${stats.total_listings} listings.
- Current Month: ${new Date().toLocaleString('default', { month: 'long' })}

Return a JSON object:
{
  "suggestedPriceMin": number,
  "suggestedPriceMax": number,
  "demandLevel": "High" | "Medium" | "Low",
  "reasoning": "1-2 short sentences",
  "pricePosition": "below" | "within" | "above"
}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.1 
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error: ${response.status}`, errorText);
      throw new Error(`Gemini AI service unavailable (${response.status})`);
    }

    const result = await response.json();
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini response format:", JSON.stringify(result));
      throw new Error("AI returned an empty or invalid response");
    }

    const guidance = JSON.parse(result.candidates[0].content.parts[0].text);

    return new Response(JSON.stringify({ success: true, guidance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Function Error:", errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check Supabase logs for more info" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
