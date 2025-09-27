import { memo } from 'react';
import { ColorOption } from '../config/colors';

interface ColorPickerProps {
  colors: ColorOption[];
  selectedColor: string;
  onColorSelect: (colorName: string) => void;
  title: string;
}

export const ColorPicker = memo(({ colors, selectedColor, onColorSelect, title }: ColorPickerProps) => (
  <div className="space-y-2">
    <h3 className="font-semibold text-white text-center mb-4">{title}</h3>
    <div className="flex flex-wrap gap-2 justify-center">
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => onColorSelect(color.name)}
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColor === color.name 
              ? 'border-white scale-110' 
              : 'border-gray-300'
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  </div>
));

ColorPicker.displayName = 'ColorPicker';
