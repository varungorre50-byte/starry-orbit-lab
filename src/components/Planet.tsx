import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/data/planetData";

export const Planet = ({ data, speedRef, onClick }: { data: PlanetData; speedRef: React.MutableRefObject<number>; onClick: () => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const accumulatedTime = useRef(0);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, data.textureUrl);
  } catch {
    texture = null;
  }

  const tiltRad = useMemo(() => (data.tilt * Math.PI) / 180, [data.tilt]);

  useFrame((_, delta) => {
    accumulatedTime.current += delta * speedRef.current;
    const time = accumulatedTime.current;

    if (groupRef.current) {
      const angle = time * data.orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
      groupRef.current.position.y = Math.sin(angle * 0.5) * 0.5;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed * 0.01;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += data.rotationSpeed * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[tiltRad, 0, 0]}>
        {data.name === "Earth" && (
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[data.radius * 1.08, 32, 32]} />
            <meshBasicMaterial color="#6DB3F2" transparent opacity={0.12} />
          </mesh>
        )}

        <mesh ref={meshRef} onClick={onClick}>
          <sphereGeometry args={[data.radius, 64, 64]} />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              roughness={0.5}
              metalness={0.1}
              emissive={data.color}
              emissiveIntensity={0.15}
            />
          ) : (
            <meshStandardMaterial color={data.color} roughness={0.4} metalness={0.15} emissive={data.color} emissiveIntensity={0.3} />
          )}
        </mesh>

        {data.hasRings && (
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 64]} />
            <meshBasicMaterial
              color={data.ringColor || "#D4C494"}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      <Html position={[0, data.radius + 0.6, 0]} center distanceFactor={25}>
        <div
          className="px-3 py-1.5 rounded-lg bg-card/85 text-foreground text-base font-bold whitespace-nowrap cursor-pointer backdrop-blur-sm border border-border/50"
          onClick={onClick}
        >
          {data.name}
        </div>
      </Html>
    </group>
  );
};
