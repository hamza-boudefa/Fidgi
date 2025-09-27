import { memo } from 'react';
import { STLModel } from './STLModel';
import { KeycapModelProps } from '../types';
import { KEYCAP_CONFIGS } from '../config/models';

export const KeycapModel = memo(({ keycapName, color, position, scale = 1, rotation }: KeycapModelProps) => {
  const keycapConfig = KEYCAP_CONFIGS[keycapName] || KEYCAP_CONFIGS['Avengers'];
  
  const keycapRotation: [number, number, number] = rotation ? [
    rotation[0] + (keycapConfig.rotationOffset.x * Math.PI) / 180,
    rotation[1] + (keycapConfig.rotationOffset.y * Math.PI) / 180,
    rotation[2] + (keycapConfig.rotationOffset.z * Math.PI) / 180
  ] : [
    (keycapConfig.rotationOffset.x * Math.PI) / 180,
    (keycapConfig.rotationOffset.y * Math.PI) / 180,
    (keycapConfig.rotationOffset.z * Math.PI) / 180
  ];
  
  const finalPosition: [number, number, number] = position ? [
    position[0] + keycapConfig.positionOffset.x,
    position[1] + keycapConfig.positionOffset.y,
    position[2] + keycapConfig.positionOffset.z
  ] : [
    keycapConfig.positionOffset.x,
    keycapConfig.positionOffset.y,
    keycapConfig.positionOffset.z
  ];
  
  const finalScale = keycapConfig.scale || scale;
  
  return (
    <STLModel 
      url={`/3d_assets/keycaps/${keycapConfig.file}`}
      color={color}
      position={finalPosition}
      scale={finalScale}
      rotation={keycapRotation}
    />
  );
});

KeycapModel.displayName = 'KeycapModel';
