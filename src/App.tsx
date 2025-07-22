import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Politica from "./pages/Politica";
import Mundo from "./pages/Mundo";
import Cultura from "./pages/Cultura";
import Entretenimento from "./pages/Entretenimento";
import Podcasts from "./pages/Podcasts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/politica" element={<Politica />} />
          <Route path="/mundo" element={<Mundo />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/entretenimento" element={<Entretenimento />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
