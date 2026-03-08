import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { image_path } = await req.json();
    if (!image_path) throw new Error("No image path provided");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const apiKey = Deno.env.get("GEMINI_API_KEY_CROP") || Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in Supabase secrets.");

    const { data: imageBlob, error: downloadError } = await supabase.storage
      .from('crop-diagnoses')
      .download(image_path);

    if (downloadError) throw new Error(`Storage Error: ${downloadError.message}`);

    const buffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // SAFE Base64 encoding for large files
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this agricultural plant image. Identify the crop and any diseases. Return JSON ONLY: { \"crop_type\": \"...\", \"diagnosis\": \"...\", \"confidence\": 0.9, \"treatment_advice\": \"...\" }" },
            { inline_data: { mime_type: imageBlob.type || "image/jpeg", data: base64 } }
          ]
        }]
      })
    });

    const result = await resp.json();
    if (!resp.ok) throw new Error(`Gemini Error: ${result.error?.message || "Unknown API Error"}`);

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return a valid JSON diagnosis.");

    return new Response(JSON.stringify({ success: true, diagnosis: JSON.parse(jsonMatch[0]) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (err) {
    console.error("Fatal Function Error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 // Still return 200 so the frontend can read the error message
    });
  }
});
