"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
// import { getUserSolarSystem } from "@/lib/db";
// import { saveSolarSystem } from "@/lib/db";
import { supabase } from "@/supabase";

export default function LandingPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, check if they have a system set up
    if (!loading && user) {
      init();
    }
  }, [user, loading, router]);

  async function init()  {
    if (!user) return;

    try {
      const {data, error} = await supabase.from("system_config").select().eq("user_id", user?.id);
      if (error) throw error;

      console.log(data);
      if (!data.length) return router.push("/data/Settings/ManageSystemAppliances");
      return router.push("/home");
    } catch (error) {
      console.error(error);
    }


  }

  // return <pre>{JSON.stringify(user, null, 2)}</pre>

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SolarView</h1>
          <p className="text-lg text-gray-600">Monitor Your Solar Energy in Real-Time</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to SolarView</CardTitle>
            <p className="text-gray-600">Get started with your solar monitoring journey</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/signup" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                Create New Account
              </Button>
            </Link>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full py-3 text-lg">
                Sign In to Existing Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Start monitoring your solar energy production and consumption</p>
        </div>
      </div>
    </div>
  );
}
