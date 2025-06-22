import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepBackIcon } from "lucide-react";
import Link from "next/link";

export default async function Solardata() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const handleSignOut = async () => {
    'use server';
    const supabase = createServerComponentClient({ cookies });
    await supabase.auth.signOut();
    redirect('/auth/login');
  };

  return (
    <>
      <div className="h-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-10 sm:px-6">
          <div className="flex justify-between py-6">
            <Link href="/home">
              <StepBackIcon size={45} className="text-black p-2" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Solar Panel Data</h1>
            <form action={handleSignOut}>
              <Button
                type="submit"
                className="rounded-md bg-yellow-300 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}