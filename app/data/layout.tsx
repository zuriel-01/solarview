'use client';

import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

export default function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? 'block whitespace-nowrap rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-950'
      : 'block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover:text-white';
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">SolarView</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Energy dashboard</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6 lg:flex-row lg:items-start lg:gap-8 lg:p-8">
        <aside className="w-full shrink-0 rounded-2xl bg-slate-800 p-3 text-white shadow-lg lg:sticky lg:top-8 lg:w-64">
          <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Navigate
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            <Link href="/data/Energygenerated" className={getLinkClass("/data/Energygenerated")}>Energy Generated</Link>
            <Link href="/data/Energyusage" className={getLinkClass("/data/Energyusage")}>Energy Usage</Link>
            <Link href="/data/Batterystatus" className={getLinkClass("/data/Batterystatus")}>Battery Status</Link>
            <Link href="/data/Optimizationtips" className={getLinkClass("/data/Optimizationtips")}>Optimization Tips</Link>
            <Link href="/data/BatteryProjection" className={getLinkClass("/data/BatteryProjection")}>Battery Projection</Link>
            <Link href="/data/Settings" className={getLinkClass("/data/Settings")}>Settings</Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          {children}
        </section>
      </main>
    </div>
  );
}