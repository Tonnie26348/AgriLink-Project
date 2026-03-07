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
    if (!image_path) throw new Error("No image_path provided in request");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY_CROP");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY_CROP is missing");
      throw new Error("API configuration error: Crop Doctor key missing");
    }

    // 1. Download image
    const { data: imageData, error: downloadError } = await supabaseClient.storage
      .from('crop-diagnoses')
      .download(image_path);

    if (downloadError) {
       console.error("Storage Download Error:", downloadError.message);
       throw new Error(`Failed to retrieve image: ${downloadError.message}`);
    }

    // 2. Prepare Base64 safely
    const arrayBuffer = await imageData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binary);

    // 3. Call Gemini with precise prompt
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this agricultural plant image. Identify the crop and any diseases or pests. Return ONLY a JSON object with: { \"crop_type\": \"common name\", \"diagnosis\": \"specific condition or 'Healthy'\", \"confidence\": float 0-1, \"treatment_advice\": \"concise actionable steps\" }" },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error: ${response.status}`, errorText);
      throw new Error(`AI Diagnosis Service error (${response.status})`);
    }

    const result = await response.json();
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid response from Gemini:", JSON.stringify(result));
      throw new Error("AI returned empty results for this image.");
    }

    let diagnosisText = result.candidates[0].content.parts[0].text;
    diagnosisText = diagnosisText.replace(/```json\n?|\n?```/g, "").trim();
    
    const diagnosis = JSON.parse(diagnosisText);

    return new Response(JSON.stringify({ success: true, diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Crop Diagnosis Error:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Please check if your Gemini API key is valid and image is clear."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
