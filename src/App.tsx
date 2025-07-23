
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Politica from "./pages/Politica";
import Mundo from "./pages/Mundo";
import Cultura from "./pages/Cultura";
import Entretenimento from "./pages/Entretenimento";
import Podcasts from "./pages/Podcasts";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin Pages
import AdminDashboard from "./pages/admin/Index";
import ArticlesPage from "./pages/admin/Articles";
import ArticleForm from "./pages/admin/ArticleForm";
import Categories from "./pages/admin/Categories";
import Users from "./pages/admin/Users";
import PodcastsPage from "./pages/admin/PodcastsPage";
import Comments from "./pages/admin/Comments";
import Newsletter from "./pages/admin/Newsletter";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import UserInvite from "./pages/admin/UserInvite";
import Media from "./pages/admin/Media";
import Banners from "./pages/admin/Banners";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/politica" element={<Politica />} />
            <Route path="/mundo" element={<Mundo />} />
            <Route path="/cultura" element={<Cultura />} />
            <Route path="/entretenimento" element={<Entretenimento />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="author">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/articles" 
              element={
                <ProtectedRoute requiredRole="author">
                  <ArticlesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/articles/new" 
              element={
                <ProtectedRoute requiredRole="author">
                  <ArticleForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/articles/:id/edit" 
              element={
                <ProtectedRoute requiredRole="author">
                  <ArticleForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requiredRole="editor">
                  <Categories />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/invite" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserInvite />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/podcasts" 
              element={
                <ProtectedRoute requiredRole="author">
                  <PodcastsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/comments" 
              element={
                <ProtectedRoute requiredRole="editor">
                  <Comments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/newsletter" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Newsletter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requiredRole="editor">
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/media" 
              element={
                <ProtectedRoute requiredRole="author">
                  <Media />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/banners" 
              element={
                <ProtectedRoute requiredRole="editor">
                  <Banners />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
