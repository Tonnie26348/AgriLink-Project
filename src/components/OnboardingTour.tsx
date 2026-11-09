import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context-definition";
import { Bot, Sparkles, ShoppingBag, Tractor, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OnboardingTour = () => {
  const { user, userRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (user) {
      const hasSeenTour = localStorage.getItem(`fsc-tour-${user.id}`);
      if (!hasSeenTour) {
        setOpen(true);
      }
    }
  }, [user]);

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`fsc-tour-${user.id}`, "true");
    }
    setOpen(false);
  };

  const farmerSteps = [
    {
      title: "Welcome to Food Supply Chain!",
      description: "We're excited to help you grow your farming business and connect with buyers directly.",
      icon: <Tractor className="w-12 h-12 text-primary" />,
    },
    {
      title: "List Your Produce",
      description: "Add your crops to the inventory to make them visible to thousands of buyers instantly.",
      icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
    },
    {
      title: "AI Plant Doctor",
      description: "Use our built-in AI to scan for diseases and get organic treatment advice anytime.",
      icon: <Bot className="w-12 h-12 text-primary" />,
    }
  ];

  const buyerSteps = [
    {
      title: "Welcome to Food Supply Chain Marketplace!",
      description: "Source the freshest produce directly from verified local farmers at fair prices.",
      icon: <ShoppingBag className="w-12 h-12 text-secondary" />,
    },
    {
      title: "Smart Filters",
      description: "Find exactly what you need by filtering through categories, locations, and price ranges.",
      icon: <Sparkles className="w-12 h-12 text-secondary" />,
    },
    {
      title: "Direct Messaging",
      description: "Chat with farmers directly to negotiate, ask about quality, or coordinate delivery.",
      icon: <CheckCircle2 className="w-12 h-12 text-secondary" />,
    }
  ];

  const activeSteps = userRole === "farmer" ? farmerSteps : buyerSteps;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-elevated rounded-3xl">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>{activeSteps[step].title}</DialogTitle>
            <DialogDescription>{activeSteps[step].description}</DialogDescription>
          </DialogHeader>
        </VisuallyHidden.Root>
        <div className={`h-32 w-full ${userRole === 'farmer' ? 'bg-primary' : 'bg-secondary'} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={step}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl shadow-soft">
              {activeSteps[step].icon}
            </div>
          </motion.div>
        </div>

        <div className="p-8 text-center space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">{activeSteps[step].title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {activeSteps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-1.5 pt-4">
            {activeSteps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? (userRole === 'farmer' ? 'w-8 bg-primary' : 'w-8 bg-secondary') : 'w-2 bg-muted'}`} 
              />
            ))}
          </div>
        </div>

        <DialogFooter className="p-8 pt-0">
          {step < activeSteps.length - 1 ? (
            <Button className="w-full h-12 rounded-xl font-bold group" onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button className="w-full h-12 rounded-xl font-bold" onClick={handleComplete}>
              Got it, let's go!
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
