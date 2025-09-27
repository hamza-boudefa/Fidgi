import { memo } from 'react';
import { CustomizerState } from '../types';

interface StepNavigationProps {
  currentStep: CustomizerState['currentStep'];
  onStepChange: (step: CustomizerState['currentStep']) => void;
}

const STEPS = [
  { key: 'housing' as const, label: 'Step 1: Housing' },
  { key: 'switch' as const, label: 'Step 2: Switch' },
  { key: 'keycap' as const, label: 'Step 3: Keycap' }
];

export const StepNavigation = memo(({ currentStep, onStepChange }: StepNavigationProps) => (
  <div className="bg-gray-600 p-2">
    <div className="max-w-4xl mx-auto flex justify-center gap-4">
      {STEPS.map((step) => (
        <button
          key={step.key}
          onClick={() => onStepChange(step.key)}
          className={`px-4 py-2 rounded ${
            currentStep === step.key ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-200'
          }`}
        >
          {step.label}
        </button>
      ))}
    </div>
  </div>
));

StepNavigation.displayName = 'StepNavigation';
