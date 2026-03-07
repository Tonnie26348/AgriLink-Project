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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    let prompt = "";
    
    if (mode === "general") {
      // General Market Analysis Mode
      const { data: topStats } = await supabaseClient.rpc('get_system_stats');
      
      prompt = `You are an AgriLink Market Analyst.
Analyze the current Kenyan agricultural market for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
Platform Context: ${topStats?.[0]?.total_farmers || 10000}+ farmers, ${topStats?.[0]?.total_buyers || 2800}+ buyers.

Return a JSON object exactly like this:
{
  "marketOverview": "1-2 sentences summarizing current trends in Kenya",
  "topPerformers": [
    { "name": "Crop Name", "trend": "Rising" | "Stable" | "Falling", "priceRange": "Ksh XX - YY" }
  ],
  "seasonalAdvice": "1 sentence advice for farmers this month",
  "demandHeatmap": [
    { "region": "Region Name", "level": number (1-100), "topCrops": ["Crop1", "Crop2"] }
  ]
}`;
    } else {
      // Specific Produce Mode (Default)
      const { data: marketData } = await supabaseClient.rpc('get_market_averages', { 
        p_name: produceType 
      });

      const stats = marketData?.[0] || { avg_price: currentPrice || 50, min_price: currentPrice || 40, max_price: currentPrice || 60, total_listings: 0 };

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
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const result = await response.json();
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error("Gemini API returned no results");
    }
    const text = result.candidates[0].content.parts[0].text;
    const guidance = JSON.parse(text);

    return new Response(JSON.stringify({ success: true, guidance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
