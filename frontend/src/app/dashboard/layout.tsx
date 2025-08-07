import Sidebar from '@/components/dashboard/Sidebar';
import { Pointer } from '@/components/magicui/pointer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4">
        {children}
         <Pointer className="fill-green-500" />
      </main>
    </div>
  );
}