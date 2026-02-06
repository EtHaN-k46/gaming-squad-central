
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import PageTransition from "./components/PageTransition";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ApexLegends = lazy(() => import("./pages/ApexLegends"));
const Valorant = lazy(() => import("./pages/Valorant"));
const CallOfDuty = lazy(() => import("./pages/CallOfDuty"));
const CallOfDutyMobile = lazy(() => import("./pages/CallOfDutyMobile"));
const SiegeX = lazy(() => import("./pages/SiegeX"));
const Calendar = lazy(() => import("./pages/Calendar"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Players = lazy(() => import("./pages/Players"));
const Games = lazy(() => import("./pages/Games"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <Suspense fallback={<LoadingSpinner />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/apex-legends" element={<ApexLegends />} />
                  <Route path="/valorant" element={<Valorant />} />
                  <Route path="/call-of-duty" element={<CallOfDuty />} />
                  <Route path="/call-of-duty-mobile" element={<CallOfDutyMobile />} />
                  <Route path="/siege-x" element={<SiegeX />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
