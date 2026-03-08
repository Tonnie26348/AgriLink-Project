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
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const apiKey = Deno.env.get("GEMINI_API_KEY_CROP") || Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const { data: imageBlob, error: downloadError } = await supabase.storage
      .from('crop-diagnoses')
      .download(image_path);

    if (downloadError) throw new Error(`Storage Error: ${downloadError.message}`);

    const buffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < uint8Array.byteLength; i++) binary += String.fromCharCode(uint8Array[i]);
    const base64 = btoa(binary);

    // Use stable v1 API and latest flash model
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    if (!resp.ok) {
      console.error("Gemini API Error:", result);
      throw new Error(`Gemini: ${result.error?.message || "Unknown Error"}`);
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI format returned.");

    return new Response(JSON.stringify({ success: true, diagnosis: JSON.parse(jsonMatch[0]) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
