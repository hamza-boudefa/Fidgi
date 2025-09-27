"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ColourfulText } from "./ColourfulText";

export const LayoutTextFlip = ({
  text = "",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}: {
  text: string;
  words: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
   

      <motion.span
        layout
        className="relative w-fit overflow-hidden rounded-md  px-4 py-2 font-sans text-2xl font-bold tracking-tight text-black  md:text-7xl dark:bg-neutral-900 py-10"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
            className={cn("inline-block whitespace-nowrap")}
          >
            <ColourfulText text={words[currentIndex]}  />
            {/* {words[currentIndex]} */}
          </motion.span>
          <motion.span
        layoutId="subtext"
        className="text-7xl font-bold tracking-tight drop-shadow-lg md:text-7x1 "
      >
        {text}
      </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
};
