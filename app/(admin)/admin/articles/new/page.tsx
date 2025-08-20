'use client';

import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ArticleForm from "@/components/ArticleForm";

export default function NewArticlePage() {
  return (
    <ProtectedRoute requiredRole="author">
      <AdminLayout title="Novo Artigo">
        <ArticleForm />
      </AdminLayout>
    </ProtectedRoute>
  );
}