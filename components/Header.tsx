"use client";


import { AlignJustify, Radar, X } from "lucide-react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDataSubmenu = () => {
    if (!session) {
      // Redirect to login page if not authenticated
      router.push('/auth/login');
      return;
    }
    
    // If authenticated, toggle the data submenu as normal
    setIsDataOpen(!isDataOpen);
  };

  return (
    <header className="flex px-16 max-md:px-5 justify-between w-full text-2xl text-white max-w-[1336px] max-md:max-w-full">
      <div className="flex text-center justify-between w-full">
        <div className="flex gap-2">
        <Radar size={30} />
          <h1>SolarView</h1>
        </div>
        <AlignJustify className="ml-auto md:hidden cursor-pointer" onClick={toggleMenu} />
      </div>
      <nav className="flex gap-10 max-md:hidden">
        <Link href="/" className="hover:text-yellow-300 transition-colors">
          Home
        </Link>
        <Link href="/about" className="hover:text-yellow-300 transition-colors">
          About
        </Link>
        <div className="relative group">
          <button onClick={toggleDataSubmenu} className="hover:text-yellow-300 transition-colors">
            Data
          </button>
          {isDataOpen && (
            <div className="absolute right-0 w-40 hidden group-hover:block text-sm bg-gray-800 rounded shadow-lg transition-opacity duration-300 delay-100 text-center">
              <Link href="/data/Energygenerated" className="block px-2 py-2 hover:bg-gray-700">
                Energy Generated
              </Link>
              <Link href="/data/Energyusage" className="block px-2 py-2 hover:bg-gray-700">
                Energy Usage
              </Link>
              <Link href="/data/Batterystatus" className="block px-2 py-2 hover:bg-gray-700">
                Battery Status
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 md:hidden">
          <div className="flex justify-end p-5">
            <X className="text-white cursor-pointer" onClick={toggleMenu} />
          </div>
          <div className="flex flex-col items-center gap-8 mt-10 text-2xl">
            <Link href="/" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
              Home
            </Link>
            <Link href="/about" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
              About
            </Link>
            <div className="relative">
              <button 
                onClick={() => {
                  if (!session) {
                    router.push('/auth/login');
                    toggleMenu();
                  } else {
                    toggleDataSubmenu();
                  }
                }} 
                className="hover:text-yellow-300 transition-colors"
              >
                Data
              </button>
              {isDataOpen && session && (
                <div className="mt-4 flex flex-col gap-4 text-lg">
                  <Link href="/data/Energygenerated" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                    Energy Generated
                  </Link>
                  <Link href="/data/Energyusage" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                    Energy Usage
                  </Link>
                  <Link href="/data/Batterystatus" className="hover:text-yellow-300 transition-colors" onClick={toggleMenu}>
                    Battery Status
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
