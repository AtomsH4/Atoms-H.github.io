import * as THREE from 'three';

import { useRecommendationTexture } from '../create-cover-texture';
import type { RecommendationModelProps } from '../model-registry';

export const DiscModel = ({
  item,
  active,
  onSelect,
}: RecommendationModelProps) => {
  const texture = useRecommendationTexture(item);

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <mesh position={[0, 0, 0.051]} castShadow receiveShadow>
        <ringGeometry args={[0.34, 2, 96]} />
        <meshStandardMaterial
          map={texture ?? undefined}
          color={active ? '#ffffff' : '#e8e8e8'}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[2, 2, 0.1, 96, 1, true]} />
        <meshPhysicalMaterial
          color={active ? '#d9d9d9' : '#bdbdbd'}
          metalness={0.85}
          roughness={0.18}
          iridescence={0.55}
        />
      </mesh>

      <mesh
        position={[0, 0, -0.051]}
        rotation={[0, Math.PI, 0]}
        castShadow
        receiveShadow
      >
        <ringGeometry args={[0.34, 2, 96]} />
        <meshPhysicalMaterial
          color="#c9c9c9"
          metalness={0.9}
          roughness={0.2}
          iridescence={0.65}
        />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.34, 0.34, 0.1, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#9d9d9d"
          metalness={0.9}
          roughness={0.22}
          iridescence={0.45}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
