'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="flex min-h-screen">
      {!isLoginPage && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {!isLoginPage && <Header />}
        <div className={isLoginPage ? "" : "p-4 md:p-8"}>
          {children}
        </div>
      </main>
    </div>
  );
}
