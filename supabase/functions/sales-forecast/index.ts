import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { produceType, location, historicalSales } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY_SALES") || Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let lastError = "";

    const prompt = `Predict future sales for ${produceType} in ${location} based on historical data: ${JSON.stringify(historicalSales)}. 
    Return JSON ONLY: { "success": true, "forecast": { "expectedDemand": "High/Medium/Low", "trend": "Rising/Stable/Falling", "advice": "..." } }`;

    for (const model of models) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const result = await resp.json();
        if (resp.ok && result.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = result.candidates[0].content.parts[0].text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return new Response(jsonMatch[0], { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        } else {
          lastError = result.error?.message || "Model failed";
        }
      } catch (e) { lastError = e.message; }
    }

    throw new Error(`Sales Forecast failed: ${lastError}`);

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
