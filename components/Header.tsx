// import Image from "next/image";
import { AlignJustify, Radar } from "lucide-react";
import React from "react";

export function Header() {
  return (
    <header className="flex px-16 max-md:px-5 justify-between w-full text-2xl text-white max-w-[1336px] max-md:max-w-full">
      <div className="flex text-center justify-between w-full">
       <div className="flex gap-2">
       <Radar size={30}/>  
        <h1>      
          SolarView
        </h1>
       </div> 
          
        <AlignJustify className="ml-auto md:hidden"/>
      </div>
      <nav className="flex gap-10 max-md:hidden">
        <a href="#home" className="hover:text-yellow-300 transition-colors">
          Home
        </a>
        <a href="#about" className="hover:text-yellow-300 transition-colors">
          About
        </a>
        {/* <a href="#data" className="hover:text-yellow-300 transition-colors">
          Data
        </a> */}

  
<ul className="relative group">
          <div className="inline-block">
            <a href="/data" className=" inline-block  pb-0.5 hover:text-yellow-300 transition-colors">
              Data
            </a>
            <div className="absolute right-1 w-40 hidden group-hover:block text-sm bg-gray-800 rounded shadow-lg transition-opacity duration-300 delay-100 text-center">
              <a href="/data/option1" className="block px-2 py-2 hover:bg-gray-700">
                Energy Input
              </a>
              <a href="/data/option2" className="block px-2 py-2 hover:bg-gray-700">
                Energy Output
              </a>
              <a href="/data/option3" className="block px-2 py-2 hover:bg-gray-700">
                Option 3
              </a>
            </div>
          </div>
        </ul>


      </nav>      
    </header>
  );
}
