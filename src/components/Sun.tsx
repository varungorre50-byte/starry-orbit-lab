import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { SUN_DATA } from "@/data/planetData";

export const Sun = ({ onClick }: { onClick: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, SUN_DATA.textureUrl);
  } catch {
    texture = null;
  }

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group>
      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[SUN_DATA.radius * 1.15, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[SUN_DATA.radius * 1.4, 32, 32]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.06} />
      </mesh>

      {/* Sun body */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[SUN_DATA.radius, 64, 64]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshBasicMaterial color={SUN_DATA.color} />
        )}
      </mesh>

      {/* Point light from sun */}
      <pointLight intensity={5} color="#FDB813" distance={150} decay={0.4} />

      <Html position={[0, SUN_DATA.radius + 1, 0]} center distanceFactor={25}>
        <div
          className="px-3 py-1.5 rounded-lg bg-card/85 text-foreground text-base font-bold whitespace-nowrap cursor-pointer backdrop-blur-sm border border-border/50"
          onClick={onClick}
        >
          Sun
        </div>
      </Html>
    </group>
  );
};
