
import { Loader2 } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse" />
        <Loader2 className="w-16 h-16 text-primary animate-spin absolute top-0 left-0" />
      </div>
      <p className="mt-4 text-sm font-bold text-primary uppercase tracking-widest animate-pulse">
        Loading Food Supply Chain...
      </p>
    </div>
  );
};

export default PageLoader;
