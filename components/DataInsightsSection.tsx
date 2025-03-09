import React from "react";
import graph from "@/assets/graph-1.webp"
import panel1 from "@/assets/panel-1.jpg"
import Image from "next/image";
export function DataInsightsSection() {
  return (
    <section className="mt-24 space-y-24 max-md:mt-10 max-md:space-y-10">
      <div className="self-center w-full max-w-[1353px] max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-[60%] max-md:ml-0 max-md:w-full">
            <Image
              src={graph}
              alt="Real-time energy monitoring interface"
              className="object-contain grow w-full aspect-[1.38] max-md:mt-10 max-md:max-w-full"
            />
          </div>
          <div className="ml-5 w-[40%] max-md:ml-0 max-md:w-full">
            <h3 className="mt-58 text-2xl text-center text-white max-md:mt-10 max-md:max-w-full">
              Live data available in the Data section – track your energy
              generation and consumption in real-time
            </h3>
          </div>
        </div>
      </div>
      {/* <div className="flex gap-5 flex-row">
        <div className="w-[40%] ">
          <h1 className=" mt-58 text-2xl text-center text-white max-md:mt-10 max-md:max-w-full">
          How efficient is your system? This platform helps you track real-time data, optimize battery performance, and ensure maximum energy savings.
          </h1>
        </div>
        <div className=" w-[60%] max-md:ml-0 max-md:w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1216eae13331be3c14bd9e0ce215e07e6734586ccf4d20d7f87611a6cf61a3c7?placeholderIfAbsent=true&apiKey=250d2626836d457e99a7cb2b3298dd36"
          alt="Energy consumption analytics"
          className="object-contain max-w-full aspect-[1.38] w-[60%px] max-md:mt-10"
        />
        </div>
      </div> */}
      <div className="self-center w-full max-w-[1353px] max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
        <div className="ml-5 w-[40%] max-md:ml-0 max-md:w-full">
            <h3 className="mt-58 text-2xl text-center text-white max-md:mt-10 max-md:max-w-full">
            How efficient is your system? This platform helps you track real-time data, optimize battery performance, and ensure maximum energy savings.
            </h3>
          </div>
          <div className="w-[60%] max-md:ml-0 max-md:w-full">
            <Image
              src={panel1}
              alt="Energy consumption analytics"
              className="object-contain grow w-full aspect-[1.38] max-md:mt-10 max-md:max-w-full"
            />
          </div>
        
        </div>
      </div>
     
    </section>
  );
}
