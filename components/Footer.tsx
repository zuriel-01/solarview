import { Radar } from "lucide-react";
import React from "react";

export function Footer() {
  return (
    <footer className="flex flex-wrap  justify-between px-20 max-md:flex-col py-14 w-full text-center text-white bg-neutral-950 max-md:h-[1000px] ">
    
        <div className=" flex flex-col text-4xl ">
          <div className="flex gap-2">
            <Radar size={40}/>  
            <h1 className="font-bold">      
              SolarView
            </h1>
          </div>      
               
          
          <nav className="mt-20 max-md:mt-10 space-y-10">
            <a
              href="#about"
              className="block text-3xl items-center font-bold hover:text-yellow-300 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="block text-xl hover:text-yellow-300 transition-colors"
            >
              Contact
            </a>
            <a
              href="#project-details"
              className="block text-xl hover:text-yellow-300 transition-colors"
            >
              Project Details
            </a>
          </nav>
        </div>
      
      <div className="flex flex-col items-center mt-30 text-3xl max-md:mt-10">
        <h2 className=" text-3xl font-bold">Get Help</h2>
        <nav className="mt-10 space-y-10 max-md:mt-10">
          <a
            href="#email"
            className="block text-xl hover:text-yellow-300 transition-colors"
          >
            Email
          </a>
          <a
            href="#chat"
            className="block text-xl hover:text-yellow-300 transition-colors"
          >
            Chat
          </a>
        </nav>
      </div>
      <div className="flex flex-col items-center mt-30 text-3xl max-md:mt-10">
        <h2 className="text-3xl font-bold">Legal</h2>
        <nav className="mt-10 space-y-10">
          <a
            href="#terms"
            className="block text-xl hover:text-yellow-300 transition-colors"
          >
            Terms of Use
          </a>
          <a
            href="#privacy"
            className="block text-xl hover:text-yellow-300 transition-colors"
          >
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
