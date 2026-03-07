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
    const { history, farmerId, cropType } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const geminiKey = Deno.env.get("GEMINI_API_KEY_SALES");
    if (!geminiKey) {
      console.error("GEMINI_API_KEY_SALES is missing");
      throw new Error("API configuration error: Sales Forecast key missing");
    }

    const prompt = `You are an expert AgriLink Sales & Market Analyst specializing in Kenyan agriculture.
Based on this historical sales data for a farmer:
${JSON.stringify(history)}
Farmer ID: ${farmerId}
Crop Type: ${cropType || 'General Produce'}
Current Month: ${new Date().toLocaleString('default', { month: 'long' })}

Tasks:
1. Forecast sales (volume in units/Ksh) for the next 4 months considering typical Kenyan agricultural seasons (Long rains, short rains, dry periods).
2. Identify if there's a growing, stable, or declining trend.
3. Provide 3 specific, actionable recommendations for the farmer to optimize their revenue (e.g., when to harvest, when to increase supply, when to pivot).

Return a JSON object exactly like this:
{
  "forecast": [
    {"month": "MonthName", "sales": number, "confidence": float (0-1)},
    ... (4 months)
  ],
  "trend": "Growing" | "Stable" | "Declining",
  "insight": "A comprehensive summary of the forecast (2-3 sentences).",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error: ${response.status}`, errorText);
      throw new Error(`AI Sales service unavailable (${response.status})`);
    }

    const result = await response.json();
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid response from Gemini:", JSON.stringify(result));
      throw new Error("AI returned empty results for forecast.");
    }

    const content = result.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Sales Forecast Error:", errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check your GEMINI_API_KEY_SALES and input data."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
