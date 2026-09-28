import React from 'react'
import { Button } from "@/components/ui/button";
import { StepBackIcon } from "lucide-react";
import Link from "next/link";

export default function Solardata() {
  return (
    <>
      <div className="h-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-10 sm:px-6">
          <div className="flex justify-between py-6">
            <Link href="/home">
              <StepBackIcon size={45} className="text-black p-2" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Solar Panel Data</h1>
            <Link href="/home">
              <Button
                type="button"
                className="rounded-md bg-yellow-300 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400"
              >
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}