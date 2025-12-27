import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthRedirect from "@/components/AuthRedirect";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import ChildDashboard from "./pages/child/ChildDashboard";
import ChildAddress from "./pages/child/ChildAddress";
import ChildWishlist from "./pages/child/ChildWishlist";
import ChildLetters from "./pages/child/ChildLetters";

import SandaDashboard from "./pages/sanda/SandaDashboard";
import SandaChildren from "./pages/sanda/SandaChildren";
import SandaChildDetail from "./pages/sanda/SandaChildDetail";
import SandaWishlist from "./pages/sanda/SandaWishlist";
import SandaLetters from "./pages/sanda/SandaLetters";

import ElfDashboard from "./pages/elf/ElfDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AuthRedirect><Index /></AuthRedirect>} />
            <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
            <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />

            {/* Child Routes */}
            <Route path="/child/dashboard" element={<ProtectedRoute allowedRoles={['child']}><ChildDashboard /></ProtectedRoute>} />
            <Route path="/child/address" element={<ProtectedRoute allowedRoles={['child']}><ChildAddress /></ProtectedRoute>} />
            <Route path="/child/wishlist" element={<ProtectedRoute allowedRoles={['child']}><ChildWishlist /></ProtectedRoute>} />
            <Route path="/child/letters" element={<ProtectedRoute allowedRoles={['child']}><ChildLetters /></ProtectedRoute>} />

            {/* Sanda Routes */}
            <Route path="/sanda/dashboard" element={<ProtectedRoute allowedRoles={['sanda']}><SandaDashboard /></ProtectedRoute>} />
            <Route path="/sanda/children" element={<ProtectedRoute allowedRoles={['sanda']}><SandaChildren /></ProtectedRoute>} />
            <Route path="/sanda/children/:id" element={<ProtectedRoute allowedRoles={['sanda']}><SandaChildDetail /></ProtectedRoute>} />
            <Route path="/sanda/wishlist" element={<ProtectedRoute allowedRoles={['sanda']}><SandaWishlist /></ProtectedRoute>} />
            <Route path="/sanda/letters" element={<ProtectedRoute allowedRoles={['sanda']}><SandaLetters /></ProtectedRoute>} />

            {/* Elf Routes */}
            <Route path="/elf/dashboard" element={<ProtectedRoute allowedRoles={['elf']}><ElfDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
