import React from "react";

export function HeroSection() {
  return (
    <section className="mt-28 flex flex-col">
      <h2 className="text-7xl text-white text-center max-md:text-[55px] max-md:mt-24 ">
      Manage solar power <br /> for optimal use
      <p className="text-neutral-500 text-3xl pt-6">
        View daily insights into your system&apos;s performance <br /> and make informed decisions.
      </p>
      </h2> 
    
    <div className="relative">
    <div       
      className="bg-cover bg-center mt-44 max-md:mt-48 h-[700px] w-full max-md:h-screen max-md:opacity-50"
      style={{backgroundImage: `url("/assets/price-solar.avif")`}}
    >
              
    </div>
            <div className="absolute inset-0 flex flex-col justify-center ml-[100px] max-md:ml-[28px] ">
            <p className="font-bold max-md:font-normal w-[400px] max-md:w-[350px] mt-[500px] max-md:mt-[0px] max-md:text-center max-md:text-xl max-md:items-center text-2xl text-gray-200">
                    Track, Analyze, and Improve Your Solar Efficiency with Daily
                    Data Insights. Ensure your solar system is performing at its
                    best.
                   </p>
            </div>
             
    </div>
    </section>
  );
}
