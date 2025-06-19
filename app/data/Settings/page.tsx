'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline">Back</Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
          <div className="w-[89px]" /> {/* Spacer for alignment */}
        </div>

        <div className="grid gap-4">
          <Link href="/data/Settings/Configuration">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">System Configuration</h2>
              <p className="text-gray-600">Configure your solar system parameters and settings.</p>
            </div>
          </Link>

          <Link href="/data/Settings/ManageSystemAppliances">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Manage System Appliances</h2>
              <p className="text-gray-600">Add and manage appliances in different rooms of your home.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 