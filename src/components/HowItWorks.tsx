import React from 'react';
import { HoverBorderGradient } from './ui/GradiantBorderButton';
import Image from 'next/image';

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Pick Your Body",
      description: "Start with   our sleek, ergonomic base, available in 6 minimalist colors.",
      color: "fidgi-red",
      image: "/image.png"
    },
    {
      number: "2", 
      title: "Choose Your Keycaps",
      description: "Add a pop of personality. Mix and match with our variety of keycap sets.",
      color: "fidgi-blue",
      image: "/image.png"
    },
    {
      number: "3",
      title: "Select Your Switch", 
      description: "Define your feel. Choose from a silent, smooth, or satisfyingly loud click.",
      color: "fidgi-green",
      image: "/image.png"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-poppins font-bold text-foreground mb-6 sm:mb-8">
            Create Your Fidgi in{' '}
            <span className="bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-12 sm:space-y-16 lg:space-y-20 xl:space-y-24 mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
          {steps.map((step, index) => (
            <div key={step.number} className={`grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Number & Content */}
              <div className={`space-y-4 sm:space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-${step.color} rounded-2xl flex items-center justify-center shadow-medium`}>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-poppins font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-poppins text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual Element */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>    
                <div className={`w-full h-48 sm:h-64 lg:h-72 xl:h-80 bg-gradient-to-br from-${step.color}/20 to-${step.color}/5 rounded-3xl shadow-soft flex items-center justify-center`}>
                  <Image src={step.image} alt={step.title} width={500} height={100} className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center flex justify-center">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center text-lg sm:text-xl px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6"
          >
            <span>Start Designing Now</span>
          </HoverBorderGradient>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;