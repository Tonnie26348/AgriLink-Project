import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, history } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY_ASSISTANT");
    if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
      console.error("GEMINI_API_KEY_ASSISTANT is missing or too short");
      return new Response(JSON.stringify({ 
        error: "AI Assistant configuration missing. Please ensure GEMINI_API_KEY_ASSISTANT is set in Supabase secrets.",
        isConfigError: true 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are the AgriLink Personal Shopping AI, a friendly and expert agricultural assistant for Kenyan buyers and farmers. 
    You help users find the best produce, understand market trends, and give nutritional advice.
    Keep your answers concise, helpful, and culturally relevant to Kenya.
    Use Ksh for prices and common Kenyan produce names.`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I am ready to assist as the AgriLink AI." }] },
      ...(history || []),
      { role: "user", parts: [{ text: prompt }] }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Gemini AI did not return any response candidates.");
    }
    
    const text = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("AI Assistant Function Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
