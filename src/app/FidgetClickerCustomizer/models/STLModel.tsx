import { useState, useEffect, memo } from 'react';
import * as THREE from 'three';
import { STLLoader, OBJLoader, MTLLoader } from 'three-stdlib';
import { ModelProps } from '../types';

interface STLModelProps extends ModelProps {
  url: string;
}

const LoadingFallback = memo(({ position, scale, rotation, color }: ModelProps) => (
  <mesh position={position} scale={scale} rotation={rotation}>
    <boxGeometry args={[2, 2, 1]} />
    <meshStandardMaterial 
      color={color || '#888888'} 
      metalness={0.1} 
      roughness={0.8}
      flatShading={false}
    />
  </mesh>
));

LoadingFallback.displayName = 'LoadingFallback';

export const STLModel = memo(({ url, color, position, scale = 1, rotation }: STLModelProps) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loader = new STLLoader();
    
    loader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        geometry.center();
        
        setGeometry(geometry);
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('STL loading error:', error);
        setError(error.message || 'Failed to load STL');
        setLoading(false);
      }
    );
  }, [url]);

  if (loading || error || !geometry) {
    return <LoadingFallback position={position} scale={scale} rotation={rotation} color={color} />;
  }

  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color={color || '#888888'} 
        metalness={0.1} 
        roughness={0.8}
        flatShading={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

STLModel.displayName = 'STLModel';
