import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "editor" | "author" | "subscriber";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // If no specific role is required, just return children
  if (!requiredRole) {
    return <>{children}</>;
  }

  // For role-based access, we would need to fetch the user's role from the profiles table
  // This is a simplified version that would need to be expanded

  return <>{children}</>;
}