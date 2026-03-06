import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Upload, ShieldCheck, AlertTriangle, Thermometer } from "lucide-react";

interface DiagnosisResult {
  crop_type: string;
  diagnosis: string;
  confidence: number;
  treatment_advice: string;
}

const AIDiagnosisDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user) return;

    try {
      setIsAnalyzing(true);
      
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('crop-diagnoses')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Call Edge Function for Analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('crop-diagnosis', {
        body: { image_path: filePath },
      });

      if (analysisError) throw analysisError;

      const diagnosisResult = analysisData.diagnosis;
      setResult(diagnosisResult);

      // 3. Save diagnosis to DB
      const { error: dbError } = await supabase.from('crop_diagnoses').insert({
        farmer_id: user.id,
        image_url: supabase.storage.from('crop-diagnoses').getPublicUrl(filePath).data.publicUrl,
        crop_type: diagnosisResult.crop_type,
        diagnosis: diagnosisResult.diagnosis,
        confidence: diagnosisResult.confidence,
        treatment_advice: diagnosisResult.treatment_advice,
      });

      if (dbError) throw dbError;

      toast({
        title: "Analysis complete!",
        description: `Diagnosis: ${diagnosisResult.diagnosis}`,
      });

    } catch (error: unknown) {
      console.error("Diagnosis error:", error);
      toast({
        title: "Error analyzing image",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            AI Plant Doctor
          </DialogTitle>
          <DialogDescription>
            Upload a clear photo of your plant's leaves or affected area for instant diagnosis.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Image Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors ${
              preview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/30"
            }`}
          >
            {preview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-soft">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                >
                  <Upload className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-bold">Click to upload photo</p>
                  <p className="text-sm text-muted-foreground">JPEG, PNG up to 5MB</p>
                </div>
                <Input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium animate-pulse">Gemini AI is examining your plant...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                  {result.crop_type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Confidence: {Math.round(result.confidence * 100)}%
                </Badge>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-foreground mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Diagnosis: {result.diagnosis}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.treatment_advice}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-700 font-medium">Recommended: Isolate</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-700 font-medium">Safe for Harvest: No</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!result && (
            <Button 
              className="w-full h-12 text-lg shadow-soft" 
              onClick={handleAnalyze} 
              disabled={!file || isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Start AI Diagnosis"}
            </Button>
          )}
          {result && (
            <Button variant="outline" className="w-full" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
              Analyze Another Plant
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIDiagnosisDialog;
