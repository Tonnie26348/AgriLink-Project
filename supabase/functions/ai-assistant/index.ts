import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { message, history } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY_ASSISTANT") || Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    // Primary: Gemini 2.0 Flash (Fastest), Fallback: Gemini 2.5
    const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let lastError = "";

    for (const model of models) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: "You are AgriLink AI, a helpful assistant for Kenyan farmers and buyers. Provide concise, expert agricultural advice." }] },
              ...(history || []),
              { role: "user", parts: [{ text: message }] }
            ]
          })
        });

        const result = await resp.json();
        if (resp.ok && result.candidates?.[0]?.content?.parts?.[0]?.text) {
          return new Response(JSON.stringify({ 
            success: true, 
            text: result.candidates[0].content.parts[0].text 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          lastError = result.error?.message || "Model failed";
        }
      } catch (e) { lastError = e.message; }
    }

    throw new Error(`AI Assistant failed: ${lastError}`);

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
