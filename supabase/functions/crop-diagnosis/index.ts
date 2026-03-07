import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_path } = await req.json();
    if (!image_path) throw new Error("No image provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY_CROP");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY_CROP is missing");

    const { data: imageData, error: downloadError } = await supabaseClient.storage
      .from('crop-diagnoses')
      .download(image_path);

    if (downloadError) throw new Error(`Storage Error: ${downloadError.message}`);

    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this agricultural plant. Return JSON ONLY: { \"crop_type\": \"...\", \"diagnosis\": \"...\", \"confidence\": 0.9, \"treatment_advice\": \"...\" }" },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Gemini API Error");

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return JSON diagnosis");
    
    const diagnosis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ success: true, diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Diagnosis Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
