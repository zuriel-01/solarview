"use client";
import * as React from "react";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { DataInsightsSection } from "./DataInsightsSection";
import { FeaturesSection } from "./FeaturesSection";
import { Footer } from "./Footer";
// import { Prefooter } from "./Prefooter";

export default function HomePage() {
  React.useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="overflow-hidden pt-28  bg-gray-950 " style={{backgroundImage: `url("/assets/hero-bg.jpg")`}}>
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
