import React from "react";
import { Timeline } from "@/components/TimeLine";

export function WhatWeProvide() {
  const data = [
    {
      title: "Spark Your Focus",
      content: (
        <div>
         
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04)]">
              <p className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto">
                Channel nervous energy and enhance concentration during meetings, study sessions, or creative work.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Soothe Your Stress",
      content: (
        <div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04)]">
              <p className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto">
                The rhythmic, tactile click provides sensory relief, helping to ease anxiety and ground you in the present moment.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Perfect Engineering",
      content: (
        <div>
        
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04)]">
              <p className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto">
                Engineered for the perfect sound and feel, each click delivers a deeply satisfying haptic response.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];
  
  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}