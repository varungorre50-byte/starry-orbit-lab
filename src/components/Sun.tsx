import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { SUN_DATA } from "@/data/planetData";

export const Sun = ({ onClick, onRightClick, showLabel = true }: { onClick: () => void; onRightClick?: (name: string) => void; showLabel?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, SUN_DATA.textureUrl);
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  } catch {
    texture = null;
  }

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.08;
    if (glowRef.current) glowRef.current.rotation.y -= dt * 0.04;
    if (coronaRef.current) {
      const t = clock.getElapsedTime();
      const pulse = 1 + Math.sin(t * 1.5) * 0.03;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  const handlePointerDown = (e: any) => {
    if (e.button === 2) {
      e.stopPropagation();
      onRightClick?.("Sun");
    }
  };

  return (
    <group>
      {/* Corona pulsing halo */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[SUN_DATA.radius * 1.6, 48, 48]} />
        <meshBasicMaterial color="#FFB347" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[SUN_DATA.radius * 1.18, 48, 48]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Sun body */}
      <mesh ref={meshRef} onPointerDown={handlePointerDown} onClick={onClick}>
        <sphereGeometry args={[SUN_DATA.radius, 128, 128]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color={SUN_DATA.color} toneMapped={false} />
        )}
      </mesh>

      {/* Solar particle sparkles */}
      <Sparkles count={40} scale={SUN_DATA.radius * 3} size={3} speed={0.4} color="#FFD27A" />

      {/* Point light from sun */}
      <pointLight intensity={5} color="#FDB813" distance={150} decay={0.4} />

      {showLabel && (
        <Html position={[0, SUN_DATA.radius + 1, 0]} center distanceFactor={25}>
          <div
            className="px-3 py-1.5 rounded-lg bg-card/85 text-foreground text-base font-bold whitespace-nowrap cursor-pointer backdrop-blur-sm border border-border/50 select-none"
            onClick={onClick}
            onContextMenu={(e) => {
              e.preventDefault();
              onRightClick?.("Sun");
            }}
          >
            Sun
          </div>
        </Html>
      )}
    </group>
  );
};
