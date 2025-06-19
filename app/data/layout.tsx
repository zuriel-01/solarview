// import { auth, signOut } from "@/auth";
// import { redirect } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { StepBackIcon } from "lucide-react";
// import Link from "next/link";

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';

export default async function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}