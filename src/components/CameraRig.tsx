import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export type CameraPreset = "default" | "top" | "side" | "close" | "far" | "tilted";

const PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  default: { pos: [0, 30, 50], target: [0, 0, 0] },
  top:     { pos: [0, 90, 0.001], target: [0, 0, 0] },
  side:    { pos: [80, 2, 0], target: [0, 0, 0] },
  close:   { pos: [0, 8, 18], target: [0, 0, 0] },
  far:     { pos: [0, 60, 110], target: [0, 0, 0] },
  tilted:  { pos: [50, 40, 50], target: [0, 0, 0] },
};

interface CameraRigProps {
  preset: CameraPreset;
  controlsRef: React.MutableRefObject<any>;
}

/**
 * Smoothly tweens the camera position + OrbitControls target whenever
 * `preset` changes. Sits inside <Canvas> so it has access to useThree().
 */
export const CameraRig = ({ preset, controlsRef }: CameraRigProps) => {
  const { camera } = useThree();
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const target = PRESETS[preset];
    if (!target) return;

    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...target.pos);
    const startTarget = controlsRef.current?.target?.clone() ?? new THREE.Vector3(0, 0, 0);
    const endTarget = new THREE.Vector3(...target.target);

    const duration = 1200;
    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const k = ease(t);
      camera.position.lerpVectors(startPos, endPos, k);
      if (controlsRef.current?.target) {
        controlsRef.current.target.lerpVectors(startTarget, endTarget, k);
        controlsRef.current.update();
      }
      camera.lookAt(controlsRef.current?.target ?? endTarget);

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [preset, camera, controlsRef]);

  return null;
};
