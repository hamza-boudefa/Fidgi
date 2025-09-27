import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';

const fidgiButtonVariants = cva(
  "font-poppins font-semibold transition-all duration-300 relative overflow-hidden btn-click-sound",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium",
        red: "bg-fidgi-red text-white hover:bg-fidgi-red/90 shadow-soft hover:shadow-medium",
        green: "bg-fidgi-green text-white hover:bg-fidgi-green/90 shadow-soft hover:shadow-medium", 
        blue: "bg-fidgi-blue text-white hover:bg-fidgi-blue/90 shadow:shadow-soft hover:shadow-medium",
        yellow: "bg-fidgi-yellow text-primary hover:bg-fidgi-yellow/90 shadow-soft hover:shadow-medium",
        outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        hero: "bg-gradient-to-r from-fidgi-red via-fidgi-blue to-fidgi-green text-white font-bold text-lg px-8 py-4 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-colored"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        hero: "h-16 px-10 py-5 text-xl"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface FidgiButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fidgiButtonVariants> {
  children: React.ReactNode;
}

export const FidgiButton = React.forwardRef<HTMLButtonElement, FidgiButtonProps>(
  ({ className, variant, size, children, onClick, ...props }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add click sound effect
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIcBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFAlFnt/yv2MdBjiS1/LNeSsFJXfH8N2QQAoTXrPp66pWFA==');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (some browsers require user interaction)
      });
      
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Button
        className={cn(fidgiButtonVariants({ variant, size }), className)}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FidgiButton.displayName = "FidgiButton";