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
    const { image_path } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    // 1. Get the image from storage
    const { data: imageData, error: downloadError } = await supabaseClient.storage
      .from('crop-diagnoses')
      .download(image_path);

    if (downloadError) throw downloadError;

    // 2. Convert image to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // 3. Call Gemini API
    const prompt = `You are a professional agricultural pathologist. 
Analyze the attached image of a plant and identify any diseases or pests.
Return the result in JSON format:
{
  "crop_type": "string (e.g., Tomato, Maize)",
  "diagnosis": "string (The name of the disease or 'Healthy')",
  "confidence": number (0 to 1),
  "treatment_advice": "string (Detailed organic and chemical treatment advice)"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("Gemini Response:", JSON.stringify(result));

    if (!result.candidates || result.candidates.length === 0) {
      throw new Error("Gemini API returned no candidates");
    }
    
    let diagnosisText = result.candidates[0].content.parts[0].text;
    // Strip markdown if Gemini includes it
    diagnosisText = diagnosisText.replace(/```json\n?|\n?```/g, "").trim();
    
    const diagnosis = JSON.parse(diagnosisText);

    return new Response(JSON.stringify({ success: true, diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Function Error:", error instanceof Error ? error.message : "An unexpected error occurred");
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
