import { memo } from 'react';
import { HousingModel, SwitchModel, KeycapModel } from '../models';
import { CustomizerState } from '../types';
import { MODEL_POSITIONS } from '../config/models';
import { HOUSING_COLORS, KEYCAP_COLORS } from '../config/colors';

interface SceneProps {
  state: CustomizerState;
}

export const Scene = memo(({ state }: SceneProps) => {
  const housingColor = HOUSING_COLORS.find(c => c.name === state.housingColor)?.value || '#888888';
  const keycapColor = KEYCAP_COLORS[state.keycap] || KEYCAP_COLORS.default;

  const rotationRadians: [number, number, number] = [
    (state.rotation.x * Math.PI) / 180,
    (state.rotation.y * Math.PI) / 180,
    (state.rotation.z * Math.PI) / 180
  ];

  const housingProps = {
    color: housingColor,
    position: [MODEL_POSITIONS.housing.x, MODEL_POSITIONS.housing.y, MODEL_POSITIONS.housing.z] as [number, number, number],
    scale: 0.1,
    rotation: rotationRadians
  };

  const switchProps = {
    switchName: state.switchType,
    position: [MODEL_POSITIONS.switch.x, MODEL_POSITIONS.switch.y, MODEL_POSITIONS.switch.z] as [number, number, number],
    scale: 0.1,
    rotation: rotationRadians
  };

  const keycapProps = {
    keycapName: state.keycap,
    color: keycapColor,
    position: [MODEL_POSITIONS.keycap.x, MODEL_POSITIONS.keycap.y, MODEL_POSITIONS.keycap.z] as [number, number, number],
    scale: 0.1,
    rotation: rotationRadians
  };

  return (
    <>
      {/* White background */}
      <color attach="background" args={['#ffffff']} />
  
      {/* Key light: main directional light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
  
      {/* Fill light: softens shadows */}
      <hemisphereLight
      //@ts-expect-error
        skyColor={0xffffff} 
        groundColor={0x888888}
        intensity={0.4}
      />
  
      {/* Back light: adds depth */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />
  
      {/* Models */}
      {state.currentStep === 'housing' && <HousingModel {...housingProps} />}
  
      {state.currentStep === 'switch' && (
        <>
          <HousingModel {...housingProps} />
          <SwitchModel {...switchProps} />
        </>
      )}
  
      {state.currentStep === 'keycap' || state.currentStep === 'emoji' as any && (
        <>
          <HousingModel {...housingProps} />
          <SwitchModel {...switchProps} />
          <KeycapModel {...keycapProps} />
        </>
      )}
    </>
  );
  
});

Scene.displayName = 'Scene';
