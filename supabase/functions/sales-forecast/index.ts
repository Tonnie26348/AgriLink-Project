import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { history, farmerId, cropType } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const geminiKey = Deno.env.get("GEMINI_API_KEY_SALES");
    if (!geminiKey) throw new Error("GEMINI_API_KEY_SALES is missing");

    const prompt = `Forecast Kenyan sales for ${cropType || 'Produce'} based on history: ${JSON.stringify(history)}. 
    Current: ${new Date().toLocaleString('en-US', { month: 'long' })}. 
    Return JSON: { "forecast": [{"month": "...", "sales": 100, "confidence": 0.8}], "trend": "Growing", "insight": "...", "recommendations": ["..."] }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + " Respond ONLY with valid JSON." }] }]
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Gemini API Error");

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return JSON forecast");
    
    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Sales Forecast Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
