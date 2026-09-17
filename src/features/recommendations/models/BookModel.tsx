import { RoundedBox } from '@react-three/drei';

import { useRecommendationTexture } from '../create-cover-texture';
import type { RecommendationModelProps } from '../model-registry';

export const BookModel = ({
  item,
  active,
  onSelect,
}: RecommendationModelProps) => {
  const texture = useRecommendationTexture(item);
  const coverColor = active ? '#161616' : '#222222';

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <RoundedBox
        args={[3, 4, 0.56]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#eee9dd" roughness={0.82} />
      </RoundedBox>

      <mesh position={[0, 0, 0.32]} castShadow receiveShadow>
        <boxGeometry args={[3.12, 4.12, 0.08]} />
        <meshStandardMaterial color={coverColor} roughness={0.46} />
      </mesh>

      <mesh position={[0, 0, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[3.12, 4.12, 0.08]} />
        <meshStandardMaterial color={coverColor} roughness={0.5} />
      </mesh>

      <mesh position={[-1.56, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 4.12, 0.72]} />
        <meshStandardMaterial color={coverColor} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0, 0.365]} receiveShadow>
        <planeGeometry args={[2.94, 3.94]} />
        <meshStandardMaterial
          key={texture?.uuid ?? 'cover-pending'}
          map={texture ?? undefined}
          color={active ? '#ffffff' : '#ededed'}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};
