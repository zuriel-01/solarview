import { Zap, Calendar } from "lucide-react";
import React from "react";

export function FeaturesSection() {
  return (
    <section className="mt-28">
      <h2 className="text-7xl text-white text-center max-md:text-[55px] max-md:mt-24">
        Key Features
      </h2>
      <p className="text-neutral-500 text-3xl pt-6 text-center pb-10">
        Discover what makes our solar monitoring system unique
      </p>

      <div className="flex justify-center max-md:px-5 items-center mb-24 w-full max-md:mt-10 max-md:max-w-full">
        <div className="flex max-md:flex-col justify-center gap-6">
          <article className="w-[45%] max-md:ml-0 max-md:w-full">
            <div className="hover:border-yellow-300 px-4 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-5 max-md:py-24 max-md:max-w-full bg-gradient-to-br from-gray-800 to-gray-900">
              <Calendar size={90} className="flex flex-col mx-auto text-yellow-300"/>
              <h3 className="mb-6 text-bold">Daily Insights</h3>
              <p>Get comprehensive daily analysis of your solar system&apos;s performance</p>
            </div>
          </article>
          <article className="w-[45%] max-md:ml-0 max-md:w-full">
            <div className="hover:border-yellow-300 px-4 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-5 max-md:pt-24 max-md:-mt-0.5 bg-gradient-to-br from-gray-800 to-gray-900">
              <Zap size={90} className="flex flex-col mx-auto text-yellow-300"/>
              <h3 className="mb-6 text-bold">Smart Optimization</h3>
              <p>
                Receive personalized tips to maximize your energy efficiency
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className="relative mt-20">
        <div 
          className="relative bg-cover bg-center h-[700px] w-full opacity-50"
          style={{backgroundImage: `url("/assets/house.jpg")`}}
        >  
        </div>
        
        <div className="absolute inset-0 text-white flex flex-col justify-center items-center h-full">
          <p className="text-lg w-[550px] max-md:w-[350px] max-md:text-center">
            Take control of your energy today. Explore daily data insights and optimize your solar power system for maximum savings
          </p>
        </div>
      </div>
    </section>
  );
}
