"use client";
import CircularGallery from "../components/CircularGallery";

import { LayoutTextFlip } from "@/components/ui/LayoutTextFlip";
import { motion } from "motion/react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { HoverBorderGradient } from "@/components/ui/GradiantBorderButton";
import {  Highlight } from "@/components/ui/HeroHighlight";
import { WhatWeProvide } from "@/components/WhatWeProvide";
import HowItWorksSection from "@/components/HowItWorks";
import SimpleFidgiStore from "../components/SimpleFidgiStore";
import PrebuiltFidgiSection from "../components/PrebuiltFidgiSection";
import OtherFidgetSection from "../components/OtherFidgetSection";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const smoothScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }


  return (
    <>
    <Navbar />
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section id="world" className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <BackgroundLines className="absolute inset-0" />
        
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <motion.div className="relative flex flex-col items-center justify-center gap-6 sm:gap-8 text-center py-8 sm:py-12">
            <LayoutTextFlip
              text=" FIDGI "
              words={["STRESSED? ", "BORED? ", "OVERSTIMULATED?  "]}
            />
          </motion.div>
          
          <p className="mt-6 sm:mt-8 text-center text-lg sm:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Designed to help you focus, relax, and find your flow
          </p>
          
          <div className="flex justify-center text-center mt-8 sm:mt-10">
            <HoverBorderGradient
              onClick={() => smoothScroll('#treasure_box')}
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center px-8 py-4 sm:px-10 sm:py-5 text-lg sm:text-xl font-semibold"
            >
              <span>Design your Fidgi</span>
            </HoverBorderGradient>
          </div>
        </div>
      </section>
      <section id="treasure_box" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <SimpleFidgiStore />
      </section>
      
      <section id="prebuilt_fidgis" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <PrebuiltFidgiSection />
      </section>
      
      <section id="other_fidgets" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <OtherFidgetSection />
      </section>
      
      <section id="reach_out" className="px-4 sm:px-6 lg:px-8">
        <Footer />
      </section>
    </div>
    </>
  );
}