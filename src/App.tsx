import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionTimeoutHandler } from "@/components/auth/SessionTimeoutHandler";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PageLoader from "@/components/layout/PageLoader";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const FarmerStorefront = lazy(() => import("./pages/FarmerStorefront"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FarmerDashboard = lazy(() => import("@/pages/farmer/FarmerDashboard"));
const BuyerDashboard = lazy(() => import("@/pages/buyer/BuyerDashboard"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const Inbox = lazy(() => import("./pages/Inbox"));
const AIInsightsPage = lazy(() => import("./pages/AIInsightsPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="agrilink-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <SessionTimeoutHandler />
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
