import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { SupabaseProvider, useSupabase } from "@/contexts/SupabaseContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Vendas } from "./pages/Vendas";
import { Clientes } from "./pages/Clientes";
import { Produtos } from "./pages/Produtos";
import ContasPagar from "./pages/ContasPagar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabase();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabase();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/vendas" element={
        <PrivateRoute>
          <Vendas />
        </PrivateRoute>
      } />
      <Route path="/clientes" element={
        <PrivateRoute>
          <Clientes />
        </PrivateRoute>
      } />
      <Route path="/produtos" element={
        <PrivateRoute>
          <Produtos />
        </PrivateRoute>
      } />
      <Route path="/contas-pagar" element={
        <PrivateRoute>
          <ContasPagar />
        </PrivateRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AppProvider>
    </SupabaseProvider>
  </QueryClientProvider>
);

export default App;
