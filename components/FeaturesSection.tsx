import {  ChartNoAxesCombinedIcon, MonitorPlay, SquareActivityIcon } from "lucide-react";
import React from "react";

export function FeaturesSection() {
  return (
    <section className="">
      <div className="flex justify-center max-md:px-5 items-center mt-28 mb-28 w-full max-md:mt-10 max-md:max-w-full">
      <div className="flex max-md:flex-col justify-center gap-6">
        <article className="w-[30%] max-md:ml-0 max-md:w-full">
          <div className=" hover:border-yellow-300 px-4 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-2 max-md:pt-24">
            <SquareActivityIcon size={90} className="flex flex-col mx-auto"/>
            <h3 className="mb-6 text-bold">Panel Health Status</h3>
            <p>
              Get alerts on panel performance and detect inefficiencies early.
            </p>
          </div>
        </article>
        <article className=" w-[30%] max-md:ml-0 max-md:w-full">
          <div className=" hover:border-yellow-300 px-4 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-5 max-md:py-24 max-md:max-w-full">
            <MonitorPlay size={90} className="flex flex-col mx-auto"/>
            <h3 className="mb-6 text-bold">Live Monitoring</h3>
            <p>Track solar energy usage in real-time to maximize efficiency.</p>
          </div>
        </article>
        <article className=" w-[30%] max-md:ml-0 max-md:w-full">
          <div className=" hover:border-yellow-300 px-4 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-5 max-md:pt-24 max-md:-mt-0.5">
            <ChartNoAxesCombinedIcon size={90} className="flex flex-col mx-auto"/>
            <h3 className="mb-6 text-bold">Optimization Tips</h3>
            <p>
              Receive AI-powered insights to improve your energy consumption.
            </p>
          </div>
        </article>
      </div>
      </div>

    
      <div className="relative">
      <div 
        className="relative bg-cover bg-center h-[700px] w-full opacity-50"
        style={{backgroundImage: `url("/assets/house.jpg")`
        // backgroundRepeat: "no-repeat",
        // backgroundSize: "cover"
      }}

      >  
      </div>
      
      <div className="absolute inset-0 text-white flex flex-col justify-center items-center h-full">
          <p className="text-lg w-[550px] max-md:w-[350px] max-md:text-center">
         
         Take control of your energy today. Explore real-time data and optimize your solar power system for maximum savings
          </p>
        </div>
      </div>
      <div className="border-1 my-10 border-solid border-gray-800 ">

      </div>
    </section>
    
  );
}
