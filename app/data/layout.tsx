'use client';

import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

export default function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect('/auth/login');
      }
    };
    checkUser();
  }, [supabase.auth]);

  const getLinkClass = (path: string) => {
    return pathname === path
      ? 'block p-2 rounded bg-gray-700'
      : 'block p-2 rounded hover:bg-gray-700';
  };

  return (
    <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col overflow-hidden">
             <header className="flex justify-between items-center p-4 bg-white border-b">
                 <h1 className="text-xl font-bold">SolarView Dashboard</h1>
                 <LogoutButton />
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
                <div className="container mx-auto px-6 py-8">
                     <aside className="w-64 bg-gray-800 text-white p-4">
                        <nav className="space-y-2">
                            <Link href="/data/Energygenerated" className={getLinkClass("/data/Energygenerated")}>Energy Generated</Link>
                            <Link href="/data/Energyusage" className={getLinkClass("/data/Energyusage")}>Energy Usage</Link>
                            <Link href="/data/Batterystatus" className={getLinkClass("/data/Batterystatus")}>Battery Status</Link>
                            <Link href="/data/Optimizationtips" className={getLinkClass("/data/Optimizationtips")}>Optimization Tips</Link>
                            <Link href="/data/BatteryProjection" className={getLinkClass("/data/BatteryProjection")}>Battery Projection</Link>
                            <Link href="/data/Settings" className={getLinkClass("/data/Settings")}>Settings</Link>
                        </nav>
                    </aside>
                    {children}
                </div>
            </main>
        </div>
    </div>
  );
}