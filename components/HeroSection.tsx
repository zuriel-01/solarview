import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleOptimizationTipsClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };

  return (
    <section className="mt-28 flex flex-col">
      <h2 className="text-7xl text-white text-center max-md:text-[55px] max-md:mt-24 ">
      Optimize solar power <br/> for peak efficiency.
      <p className="text-neutral-500 text-3xl pt-6">
        Monitor your system&apos;s performance and get daily insights
      </p>
      </h2> 
  
      <div className="flex justify-center mt-20">
        <Link href="/data/Optimizationtips" onClick={handleOptimizationTipsClick}>
          <button className="px-8 py-4 border-2 border-yellow-300 border-solid rounded-4xl hover:bg-yellow-300 hover:text-gray-950 transition-colors">
            <p className="text-white hover:text-gray-950 text-lg">
              Get Optimization Tips
            </p>
          </button>
        </Link>
      </div>
    
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
