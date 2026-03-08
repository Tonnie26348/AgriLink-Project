import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import FarmerStorefront from "./pages/FarmerStorefront";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import FarmerDashboard from "@/pages/farmer/FarmerDashboard";
import BuyerDashboard from "@/pages/buyer/BuyerDashboard";
import ProfilePage from "./pages/Profile";
import OrdersPage from "./pages/OrdersPage";
import Inbox from "./pages/Inbox";
import AIInsightsPage from "./pages/AIInsightsPage";
import FeaturesPage from "./pages/FeaturesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ImpactPage from "./pages/ImpactPage";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="agrilink-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename="/AgriLink">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/farmer/:id" element={<FarmerStorefront />} />
              <Route path="/ai-insights" element={<AIInsightsPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <FarmerDashboard activeTab="overview" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/dashboard/inventory"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <FarmerDashboard activeTab="inventory" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/dashboard/orders"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <FarmerDashboard activeTab="orders" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/dashboard/harvests"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <FarmerDashboard activeTab="calendar" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/dashboard/ai-insights"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <FarmerDashboard activeTab="ai-insights" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/dashboard/messages"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <FarmerDashboard activeTab="messages" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <BuyerDashboard activeTab="overview" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/dashboard/market"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <BuyerDashboard activeTab="market" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/dashboard/favorites"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <BuyerDashboard activeTab="favorites" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/dashboard/orders"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <BuyerDashboard activeTab="orders" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/dashboard/messages"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <BuyerDashboard activeTab="messages" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <Inbox />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
