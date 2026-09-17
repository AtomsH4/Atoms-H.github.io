import {
  ContactShadows,
  Environment,
  Lightformer,
  PresentationControls,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import * as THREE from 'three';

import { recommendationModelRegistry } from './model-registry';
import {
  resolvePresentation,
  type RecommendationItem,
} from './recommendation-types';
import {
  compactSlots,
  desktopSlots,
  getStageItems,
  type StageSlot,
} from './stage-layout';

export type RecommendationStageProps = {
  items: RecommendationItem[];
  activeId: string;
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
  onFailure: () => void;
};

type StageModelProps = {
  item: RecommendationItem;
  active: boolean;
  reducedMotion: boolean;
  slot: StageSlot;
  onSelect: () => void;
};

const applySlot = (group: THREE.Group, slot: StageSlot) => {
  group.position.set(...slot.position);
  group.rotation.set(...slot.rotation);
  group.scale.setScalar(slot.scale);
};

const isSlotSettled = (group: THREE.Group, slot: StageSlot) => {
  const positionDistance = group.position.distanceToSquared(
    new THREE.Vector3(...slot.position),
  );
  const rotationDistance =
    Math.abs(group.rotation.x - slot.rotation[0]) +
    Math.abs(group.rotation.y - slot.rotation[1]) +
    Math.abs(group.rotation.z - slot.rotation[2]);

  return (
    positionDistance < 0.000001 &&
    rotationDistance < 0.001 &&
    Math.abs(group.scale.x - slot.scale) < 0.001
  );
};

const ActivePresentation = ({
  children,
  reducedMotion,
  resetKey,
}: {
  children: ReactNode;
  reducedMotion: boolean;
  resetKey: string;
}) => {
  const invalidate = useThree((state) => state.invalidate);
  const dragging = useRef(false);
  const snapTimeRemaining = useRef(0);

  useFrame((_, delta) => {
    if (dragging.current) {
      invalidate();
      return;
    }

    if (snapTimeRemaining.current > 0) {
      snapTimeRemaining.current = Math.max(
        0,
        snapTimeRemaining.current - delta,
      );
      invalidate();
    }
  });

  const beginDrag = () => {
    dragging.current = true;
    snapTimeRemaining.current = 0;
    invalidate();
  };
  const endDrag = () => {
    dragging.current = false;
    snapTimeRemaining.current = reducedMotion ? 0 : 1.2;
    invalidate();
  };

  return (
    <group
      onPointerDown={beginDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
    >
      <PresentationControls
        key={`${resetKey}-${reducedMotion ? 'reduced' : 'animated'}`}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 10, Math.PI / 10]}
        azimuth={[-Math.PI / 6, Math.PI / 6]}
        speed={0.8}
        zoom={1}
        snap={reducedMotion ? true : 0.18}
        damping={reducedMotion ? 0.0001 : 0.16}
      >
        {children}
      </PresentationControls>
    </group>
  );
};

const StageModel = ({
  item,
  active,
  reducedMotion,
  slot,
  onSelect,
}: StageModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialized = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const presentation = resolvePresentation(item.category, item.presentation);
  const Model = recommendationModelRegistry[presentation];

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (!initialized.current || reducedMotion) {
      applySlot(group, slot);
      initialized.current = true;
    }

    invalidate();
  }, [invalidate, reducedMotion, slot]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || reducedMotion || isSlotSettled(group, slot)) return;

    const damping = 10;
    group.position.set(
      THREE.MathUtils.damp(
        group.position.x,
        slot.position[0],
        damping,
        delta,
      ),
      THREE.MathUtils.damp(
        group.position.y,
        slot.position[1],
        damping,
        delta,
      ),
      THREE.MathUtils.damp(
        group.position.z,
        slot.position[2],
        damping,
        delta,
      ),
    );
    group.rotation.set(
      THREE.MathUtils.damp(
        group.rotation.x,
        slot.rotation[0],
        damping,
        delta,
      ),
      THREE.MathUtils.damp(
        group.rotation.y,
        slot.rotation[1],
        damping,
        delta,
      ),
      THREE.MathUtils.damp(
        group.rotation.z,
        slot.rotation[2],
        damping,
        delta,
      ),
    );
    group.scale.setScalar(
      THREE.MathUtils.damp(group.scale.x, slot.scale, damping, delta),
    );

    if (isSlotSettled(group, slot)) {
      applySlot(group, slot);
      return;
    }

    invalidate();
  });

  const model = (
    <Model item={item} active={active} onSelect={onSelect} />
  );

  return (
    <group ref={groupRef}>
      {active ? (
        <ActivePresentation
          reducedMotion={reducedMotion}
          resetKey={item.id}
        >
          {model}
        </ActivePresentation>
      ) : (
        model
      )}
    </group>
  );
};

const ContextLossListener = ({ onFailure }: { onFailure: () => void }) => {
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };

    canvas.dataset.recommendationStageReady = 'true';
    canvas.addEventListener('webglcontextlost', handleContextLost, {
      once: true,
    });

    return () => {
      delete canvas.dataset.recommendationStageReady;
      canvas.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, [canvas, onFailure]);

  return null;
};

export const RecommendationStage = ({
  items,
  activeId,
  compact,
  reducedMotion,
  onSelect,
  onFailure,
}: RecommendationStageProps) => {
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const stageItems = getStageItems(
    items.map((item) => item.id),
    activeId,
    compact,
  );

  return (
    <Canvas
      aria-hidden="true"
      style={{ height: 'clamp(28rem, 68vh, 50rem)' }}
      dpr={[1, 1.5]}
      frameloop="demand"
      shadows
      camera={{ position: [0, 0, 9], fov: 34 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      }}
    >
      <ContextLossListener onFailure={onFailure} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[4, 6, 7]}
        intensity={2.2}
        castShadow
      />
      <Environment background={false}>
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[0, 4, 5]}
          scale={[8, 3]}
        />
      </Environment>

      {stageItems.map(({ id, offset }) => {
        const item = itemsById.get(id);
        if (!item) return null;

        const slot = compact
          ? compactSlots[String(offset) as keyof typeof compactSlots]
          : desktopSlots[String(offset) as keyof typeof desktopSlots];

        return (
          <StageModel
            key={id}
            item={item}
            active={id === activeId}
            reducedMotion={reducedMotion}
            slot={slot}
            onSelect={() => onSelect(id)}
          />
        );
      })}

      <ContactShadows
        key={activeId}
        frames={1}
        opacity={0.2}
        blur={2.5}
        resolution={256}
      />
    </Canvas>
  );
};
