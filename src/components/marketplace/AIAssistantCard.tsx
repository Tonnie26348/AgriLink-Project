import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, MessageSquare, Apple, Heart, Wallet } from "lucide-react";
import AIChatDialog from "./AIChatDialog";

const AIAssistantCard = () => {
  const [activeTip, setActiveTip] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const tips = [
    {
      icon: Apple,
      title: "Nutritional Peak",
      text: "Tomatoes are currently at their nutritional peak in Nakuru. Great for Vitamin C boost!",
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      icon: Wallet,
      title: "Budget Finder",
      text: "Maize prices are expected to drop by 15% next week. You might want to wait for better deals.",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      icon: Heart,
      title: "Seasonal Best",
      text: "It's avocado season! High quality Hass avocados are available at lower prices from Meru farmers.",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  const nextTip = () => setActiveTip((prev) => (prev + 1) % tips.length);

  const CurrentIcon = tips[activeTip].icon;

  return (
    <>
      <Card className="shadow-soft border-border/50 bg-gradient-to-br from-secondary/5 to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Bot className="w-12 h-12 text-secondary" />
        </div>
        <CardHeader className="pb-3 border-b border-border/10">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Personal Shopping AI
          </CardTitle>
          <CardDescription>Your intelligent market companion</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${tips[activeTip].bg} border border-secondary/10 transition-all duration-500`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-white shadow-sm ${tips[activeTip].color}`}>
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">{tips[activeTip].title}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                "{tips[activeTip].text}"
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={nextTip} variant="outline" size="sm" className="flex-1 gap-2 rounded-xl text-xs">
                Next Tip
              </Button>
              <Button 
                size="sm" 
                className="flex-1 gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs"
                onClick={() => setChatOpen(true)}
              >
                Ask AI <MessageSquare className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AIChatDialog 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
        initialMessage={`I noticed you were reading about ${tips[activeTip].title}. How can I help you with that or anything else regarding the market today?`}
      />
    </>
  );
};

export default AIAssistantCard;
