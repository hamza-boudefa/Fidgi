import { memo } from 'react';

interface Option {
  name: string;
  [key: string]: any;
}

interface OptionSelectorProps {
  options: Option[];
  selectedOption: string;
  onOptionSelect: (optionName: string) => void;
  title: string;
  layout?: 'horizontal' | 'grid';
}

export const OptionSelector = memo(({ 
  options, 
 
  onOptionSelect, 
  title, 
  layout = 'horizontal' 
}: OptionSelectorProps) => {
  const containerClass = layout === 'grid' 
    ? 'grid grid-cols-4 md:grid-cols-5 gap-1'
    : 'flex gap-1 justify-center';

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-white text-center mb-4">{title}</h3>
      <div className={containerClass}>
        {options.map((option) => (
          <button
            key={option.name}
            onClick={() => onOptionSelect(option.name)}
            // className={`px-2 py-1 text-xs rounded-3xl ${
            //   selectedOption === option.name
            //     ? 'bg-blue-500 text-white'
            //     : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            // }`}
             className={`px-2 py-1 text-xs rounded-3xl poppins font-semibold border border-black focus:bg-black focus:text-white`}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
});

OptionSelector.displayName = 'OptionSelector';
