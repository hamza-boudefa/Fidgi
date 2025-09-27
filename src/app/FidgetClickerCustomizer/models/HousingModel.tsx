import { memo } from 'react';
import { STLModel } from './STLModel';
import { HousingModelProps } from '../types';

export const HousingModel = memo(({ color, position, scale = 1, rotation }: HousingModelProps) => (
  <STLModel 
    url="/3d_assets/clickers/1x1_clicker.stl"
    color={color}
    position={position}
    scale={scale}
    rotation={rotation}
  />
));

HousingModel.displayName = 'HousingModel';
