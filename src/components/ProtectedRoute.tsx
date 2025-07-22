
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

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

  // If profile is not loaded yet, show loading
  if (!profile) {
    return <div className="flex h-screen items-center justify-center">Carregando perfil...</div>;
  }

  // Check if user has the required role
  const userRole = profile.role;
  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    editor: 3,
    author: 2,
    subscriber: 1
  };

  // Allow access if user's role is at least as high as the required role
  if (roleHierarchy[userRole] >= roleHierarchy[requiredRole]) {
    return <>{children}</>;
  }

  // If user doesn't have the required role, redirect to home
  return <Navigate to="/" replace />;
}
