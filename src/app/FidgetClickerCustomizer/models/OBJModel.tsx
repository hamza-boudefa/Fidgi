import { useState, useEffect, memo } from 'react';
import * as THREE from 'three';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import { ModelProps } from '../types';

interface OBJModelProps extends ModelProps {
  objUrl: string;
  mtlUrl: string;
}

const LoadingFallback = memo(({ position, scale, rotation }: ModelProps) => (
  <mesh position={position} scale={scale} rotation={rotation}>
    <boxGeometry args={[2, 2, 1]} />
    <meshStandardMaterial 
      color="#888888" 
      metalness={0.1} 
      roughness={0.8}
      flatShading={false}
    />
  </mesh>
));

LoadingFallback.displayName = 'LoadingFallback';

export const OBJModel = memo(({ objUrl, mtlUrl, position, scale = 1, rotation }: OBJModelProps) => {
  const [object, setObject] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    
    mtlLoader.load(
      mtlUrl,
      (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        
        objLoader.load(
          objUrl,
          (object) => {
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
            
            setObject(object);
            setLoading(false);
          },
          undefined,
          (error) => {
            console.error('OBJ loading error:', error);
            setError(error.message || 'Failed to load OBJ');
            setLoading(false);
          }
        );
      },
      undefined,
      (error) => {
        console.error('MTL loading error:', error);
        setError(error.message || 'Failed to load MTL');
        setLoading(false);
      }
    );
  }, [objUrl, mtlUrl]);

  if (loading || error || !object) {
    return <LoadingFallback position={position} scale={scale} rotation={rotation} />;
  }

  return (
    <primitive object={object} position={position} scale={scale} rotation={rotation} />
  );
});

OBJModel.displayName = 'OBJModel';
