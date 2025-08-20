'use client';

import { useParams } from 'next/navigation';
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ArticleForm from "@/components/ArticleForm";

export default function EditArticlePage() {
  const params = useParams();
  const articleId = params.id as string;

  return (
    <ProtectedRoute requiredRole="author">
      <AdminLayout title="Editar Artigo">
        <ArticleForm articleId={articleId} />
      </AdminLayout>
    </ProtectedRoute>
  );
}