import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminLayout from '@/components/AdminLayout';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default async function AdminLayoutWrapper({ 
  children 
}: AdminLayoutWrapperProps) {
  const supabase = createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'editor', 'author'].includes(profile.role)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen">
      <AdminLayout title="Painel Administrativo">
        {children}
      </AdminLayout>
    </div>
  );
}