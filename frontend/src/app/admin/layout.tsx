'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Full height with header included */}
        <AdminSidebar />
        
        {/* Main Content - Full width */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
