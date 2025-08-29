import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Adopt from "./pages/Adopt";
import RescuedAnimals from "./pages/RescuedAnimals";
import Knowledge from "./pages/Knowledge";
import Donate from "./pages/Donate";
import Volunteer from "./pages/Volunteer";
import LostFound from "./pages/LostFound";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="adopt" element={<Adopt />} />
            <Route path="rescued-animals" element={<RescuedAnimals />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="donate" element={<Donate />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="lost-found" element={<LostFound />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
