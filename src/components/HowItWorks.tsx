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
    <section className="py-20 lg:py-32 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="text-4xl lg:text-6xl font-poppins font-bold text-foreground mb-8">
            Create Your Fidgi in{' '}
            <span className="bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
            
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-16 lg:space-y-24 mb-16 lg:mb-24">
          {steps.map((step, index) => (
            <div key={step.number} className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Number & Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-${step.color} rounded-2xl flex items-center justify-center shadow-medium`}>
                    <span className="text-3xl lg:text-4xl font-poppins font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-poppins font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xl lg:text-2xl font-poppins text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual Element */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>    
                <div className={`w-full h-64 lg:h-80 bg-gradient-to-br from-${step.color}/20 to-${step.color}/5 rounded-3xl shadow-soft flex items-center justify-center`}>
                  <Image src={step.image} alt={step.title} width={500} height={100} />
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
              className="dark:bg-black bg-white text-black dark:text-white flex items-center text-xl px-12 py-6"
            >
              <span>Start Designing Now</span>
            </HoverBorderGradient>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;