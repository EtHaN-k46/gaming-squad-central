
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Index from "./pages/Index";
import ApexLegends from "./pages/ApexLegends";
import Valorant from "./pages/Valorant";
import CallOfDuty from "./pages/CallOfDuty";
import CallOfDutyMobile from "./pages/CallOfDutyMobile";
import SiegeX from "./pages/SiegeX";
import Calendar from "./pages/Calendar";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Players from "./pages/Players";
import Games from "./pages/Games";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-black">
            <Header />
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
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
