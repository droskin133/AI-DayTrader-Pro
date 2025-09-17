import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import Alerts from "./pages/Alerts";
import News from "./pages/News";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Legal from "./pages/Legal";
import Backtests from "./pages/Backtests";
import Admin from "./pages/Admin";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Paywall from "./pages/Paywall";
import NotFound from "./pages/NotFound";
import Watchlist from "./pages/Watchlist";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/stock/:ticker" element={<Stock />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/news" element={<News />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/backtests" element={<Backtests />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/paywall" element={<Paywall />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
