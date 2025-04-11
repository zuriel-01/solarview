import React from "react";
import graph from "@/assets/graph-1.webp"
import panel1 from "@/assets/panel-1.jpg"
import Image from "next/image";
export function DataInsightsSection() {
  return (
    <section className="mt-24 space-y-24 max-md:mt-10 max-md:space-y-10">

    <div className=" hidden md:block">
    <div className="flex flex-row mx-14  hover:border-yellow-300 px-4 text-2xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 mb-10">

<div className="w-[50%] my-14 border-4 border-gray-700 rounded-3xl">
  <div className="px-4 py-4">
  <Image
        src={graph}
        alt="Energy consumption analytics"
        className="rounded-3xl h-[270px]"
      />
  </div>    
</div>    
<div className="w-[50%] px-20 items-center flex">
Live data available in the Data section – track your energy
        generation and consumption in real-time
</div>

</div>
<div className="flex flex-row mx-14  hover:border-yellow-300 px-4 text-2xl text-center text-white rounded-3xl border-gray-700 border-solid border-4">
<div className="w-[50%] px-20 items-center flex">
How efficient is your system? <br/>This platform helps you track real-time data, optimize battery performance, and ensure maximum energy savings.
</div>
<div className="w-[50%] my-14 border-4 border-gray-700 rounded-3xl">
  <div className="px-4 py-4">
  <Image
        src={panel1}
        alt="Energy consumption analytics"
        className="rounded-3xl h-[270px] "
      />
  </div>    
</div>    
</div>
    </div> 







    <div className="max-md:visible md:hidden">
    <div className="flex flex-col mx-14  hover:border-yellow-300 px-4 text-2xl text-center text-white mb-8 rounded-3xl border-gray-700 border-solid border-4">

<div className="h-[50%] my-14 border-4 border-gray-700 rounded-3xl">
  <div className="px-4 py-4">
  <Image
        src={graph}
        alt="Energy consumption analytics"
        className="rounded-3xl h-[270px]"
      />
  </div>    
</div>    
<div className="h-[50%] pb-8 items-center flex ">
Live data available in the Data section – track your energy
        generation and consumption in real-time
</div>

</div>
<div className="flex flex-col mx-14  hover:border-yellow-300 px-4 text-2xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 ">
<div className="h-[50%] pt-8 items-center flex">
How efficient is your system? <br/>This platform helps you track real-time data, optimize battery performance, and ensure maximum energy savings.
</div>
<div className="h-[50%] my-14 border-4 border-gray-700 rounded-3xl">
  <div className="px-4 py-4">
  <Image
        src={panel1}
        alt="Energy consumption analytics"
        className="rounded-3xl h-[270px] object-cover "
      />
  </div>    
</div>    
</div>

    </div>
    
   </section>
  );
}
