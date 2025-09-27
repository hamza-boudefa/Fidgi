import { memo } from 'react';
import { OBJModel } from './OBJModel';
import { SwitchModelProps } from '../types';
import { SWITCH_TYPES } from '../config/models';

export const SwitchModel = memo(({ switchName, position, scale = 1, rotation }: SwitchModelProps) => {
  const switchConfig = SWITCH_TYPES.find(s => s.name === switchName) || SWITCH_TYPES[0];
  
  const switchRotation: [number, number, number] = rotation ? [
    rotation[0] + (switchConfig.rotationOffset.x * Math.PI) / 180,
    rotation[1] + (switchConfig.rotationOffset.y * Math.PI) / 180,
    rotation[2] + (switchConfig.rotationOffset.z * Math.PI) / 180
  ] : [
    (switchConfig.rotationOffset.x * Math.PI) / 180,
    (switchConfig.rotationOffset.y * Math.PI) / 180,
    (switchConfig.rotationOffset.z * Math.PI) / 180
  ];
  
  const finalScale = switchConfig.scale || scale;
  
  return (
    <OBJModel 
      objUrl={`/3d_assets/switches/${switchConfig.folder}/${switchConfig.objFile}`}
      mtlUrl={`/3d_assets/switches/${switchConfig.folder}/${switchConfig.mtlFile}`}
      position={position}
      scale={finalScale}
      rotation={switchRotation}
    />
  );
});

SwitchModel.displayName = 'SwitchModel';
