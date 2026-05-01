import React, { useState, useEffect } from "react";
import { Language, LanguageContext } from "./language-context-definition";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.marketplace": "Marketplace",
    "nav.ai_insights": "AI Insights",
    "nav.impact": "Impact",
    "hero.title": "Connect Farm to Market Directly",
    "hero.subtitle": "AgriLink eliminates middlemen by bridging farmers and buyers with transparent pricing and direct trade.",
    "market.search": "What are you looking for?",
    "market.filters": "Filters",
    "market.categories": "Categories",
    "dash.overview": "Overview",
    "dash.inventory": "Inventory",
    "dash.orders": "Orders",
    "dash.welcome": "Welcome back",
    "ai.doctor": "AI Plant Doctor",
    "ai.pricing": "AI Pricing Strategy",
  },
  sw: {
    "nav.home": "Nyumbani",
    "nav.marketplace": "Sokoni",
    "nav.ai_insights": "Uchambuzi wa AI",
    "nav.impact": "Matokeo",
    "hero.title": "Unganisha Shamba na Soko Moja kwa Moja",
    "hero.subtitle": "AgriLink huondoa madalali kwa kuunganisha wakulima na wanunuzi kwa bei wazi na biashara ya moja kwa moja.",
    "market.search": "Unatafuta nini leo?",
    "market.filters": "Vichujio",
    "market.categories": "Jamii",
    "dash.overview": "Muhtasari",
    "dash.inventory": "Stoo",
    "dash.orders": "Maagizo",
    "dash.welcome": "Karibu tena",
    "ai.doctor": "Daktari wa Mimea wa AI",
    "ai.pricing": "Mkakati wa Bei wa AI",
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("agrilink-lang") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("agrilink-lang", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
