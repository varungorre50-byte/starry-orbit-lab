import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/data/planetData";

export const Planet = ({ data, onClick }: { data: PlanetData; onClick: () => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, data.textureUrl);
  } catch {
    texture = null;
  }

  const tiltRad = useMemo(() => (data.tilt * Math.PI) / 180, [data.tilt]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      const angle = time * data.orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
      // slight y variation for 3D depth
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
      {/* Axial tilt */}
      <group rotation={[tiltRad, 0, 0]}>
        {/* Atmosphere glow */}
        {data.name === "Earth" && (
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[data.radius * 1.08, 32, 32]} />
            <meshBasicMaterial color="#6DB3F2" transparent opacity={0.12} />
          </mesh>
        )}

        {/* Planet body */}
        <mesh ref={meshRef} onClick={onClick}>
          <sphereGeometry args={[data.radius, 64, 64]} />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              roughness={0.8}
              metalness={0.1}
            />
          ) : (
            <meshStandardMaterial color={data.color} roughness={0.7} metalness={0.2} />
          )}
        </mesh>

        {/* Rings for Saturn and Uranus */}
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

      {/* Planet label */}
      <Html position={[0, data.radius + 0.6, 0]} center distanceFactor={25}>
        <div
          className="px-2 py-0.5 rounded bg-card/80 text-foreground text-xs font-medium whitespace-nowrap cursor-pointer backdrop-blur-sm border border-border/50"
          onClick={onClick}
        >
          {data.name}
        </div>
      </Html>
    </group>
  );
};
