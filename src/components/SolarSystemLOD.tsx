import { useRef, ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Wraps the solar system contents and fades them out as the camera zooms far away,
 * replacing them with a single bright star point so the whole system looks like
 * one star among the Milky Way.
 */
export const SolarSystemLOD = ({
  children,
  fadeStart = 220,
  fadeEnd = 600,
}: {
  children: ReactNode;
  fadeStart?: number;
  fadeEnd?: number;
}) => {
  const systemRef = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Sprite>(null);
  const { camera } = useThree();

  // Build a soft round sprite texture once
  const spriteTexture = useRef<THREE.CanvasTexture | null>(null);
  if (!spriteTexture.current) {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,240,200,1)");
    grad.addColorStop(0.25, "rgba(255,200,120,0.7)");
    grad.addColorStop(0.6, "rgba(255,150,80,0.15)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    spriteTexture.current = new THREE.CanvasTexture(canvas);
  }

  useFrame(() => {
    const dist = camera.position.length();
    // 0 = full system visible, 1 = fully a star
    const t = THREE.MathUtils.clamp(
      (dist - fadeStart) / (fadeEnd - fadeStart),
      0,
      1
    );

    if (systemRef.current) {
      const visible = t < 0.98;
      systemRef.current.visible = visible;
      systemRef.current.traverse((obj) => {
        const anyObj = obj as any;
        const mat = anyObj.material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (!mat) return;
        const apply = (m: THREE.Material) => {
          if ((m as any).__origOpacity === undefined) {
            (m as any).__origOpacity = (m as any).opacity ?? 1;
            (m as any).__origTransparent = (m as any).transparent ?? false;
          }
          (m as any).transparent = true;
          (m as any).opacity = (m as any).__origOpacity * (1 - t);
        };
        if (Array.isArray(mat)) mat.forEach(apply);
        else apply(mat);
      });
    }

    if (starRef.current) {
      // Scale star with distance so it stays a consistent dot size on screen
      const scale = Math.max(2, dist * 0.018);
      starRef.current.scale.setScalar(scale);
      const mat = starRef.current.material as THREE.SpriteMaterial;
      mat.opacity = t;
    }
  });

  return (
    <>
      <group ref={systemRef}>{children}</group>
      <sprite ref={starRef}>
        <spriteMaterial
          map={spriteTexture.current}
          color="#FFD27A"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </>
  );
};
