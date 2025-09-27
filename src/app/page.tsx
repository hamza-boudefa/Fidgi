"use client";
import CircularGallery from "../components/CircularGallery";

import { LayoutTextFlip } from "@/components/ui/LayoutTextFlip";
import { motion } from "motion/react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { HoverBorderGradient } from "@/components/ui/GradiantBorderButton";
import {  Highlight } from "@/components/ui/HeroHighlight";
import { WhatWeProvide } from "@/components/WhatWeProvide";
import HowItWorksSection from "@/components/HowItWorks";
import FidgetClickerCustomizer from "./FidgetClickerCustomizer/FidgetClickerCustomizer";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section id="world" className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <BackgroundLines  className="absolute inset-0" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div className="relative  mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row h-44">
            <LayoutTextFlip
              text=" FIDGI "
              words={["STRESSED? ", "BORED? ", "OVERSTIMULATED?  "]}
            />
          </motion.div>
          
          <p className="mt-4 text-center text-base text-neutral-600 dark:text-neutral-400">
            Designed to help you focus, relax, and find your flow
          </p>
          
          <div className="flex justify-center text-center mt-6">
            <HoverBorderGradient
              onClick={() => smoothScroll('#treasure_box')}
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center"
            >
              <span>Design your Fidgi</span>
            </HoverBorderGradient>
          </div>
        </div>

        {/* Circular Gallery positioned absolutely within hero section */}
      
      </section>
     <div className="relative -top-96 h-screen w-full ">
          <CircularGallery
            bend={3}
            textColor="#000000"
            font="bold 40px 'Poppins', sans-serif"
            scrollEase={0.02}
            items={[
              { image: "/image.png", text: "Am just a girl" },
              { image: "/image.png", text: "Lava" },
              { image: "/image.png", text: "" },
            ]}
          />
        </div>
        <div id="rest" className="relative bottom-64">
        <section id="discover" className="py-20">
        {/* <HeroHighlight containerClassName="h-auto min-h-[400px]"> */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: [20, -5, 0],
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto"
          >
            From Mindless habit to Mindful Ritual. <br/>
            In a world of constant notifications and endless to-do lists, your mind deserves a break. We designed Fidgi to turn restless energy into a moment of grounding satisfaction, 
            <Highlight className="text-black dark:text-white">
            helping you reclaim your focus one click at a time.
            </Highlight>
          </motion.h1>
        {/* </HeroHighlight> */}
      </section>
        </div>
      {/* Hero Highlight Section */}
    
      <section>
        <WhatWeProvide />   
      </section>
      <section>
        <HowItWorksSection />
      </section>  
      <section id="treasure_box">
        <FidgetClickerCustomizer  />
      </section>
      <section id="reach_out">
        <Footer />
      </section>
      {/* Add more sections as needed */}
      {/* <section className="py-20">
        <YourNextComponent />
      </section> */}
    </div>
  );
}