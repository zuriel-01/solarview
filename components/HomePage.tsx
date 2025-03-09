"use client";
import * as React from "react";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { DataInsightsSection } from "./DataInsightsSection";
import { FeaturesSection } from "./FeaturesSection";
import { Footer } from "./Footer";
// import { Prefooter } from "./Prefooter";

export default function HomePage() {
  return (
    <main className="overflow-hidden pt-16 bg-gray-950 " style={{backgroundImage: `url("/assets/hero-bg.jpg")`}}>
      <div className="flex flex-col w-full max-md:max-w-full">
      
        <Header />
        <HeroSection />
        <DataInsightsSection />
        <FeaturesSection />
        {/* <Prefooter/> */}
      </div>
      <Footer />
    </main>
  );
}
