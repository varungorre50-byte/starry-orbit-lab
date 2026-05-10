import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PLANETS } from "@/data/planetData";
import { computePlanetPosition } from "@/lib/orbit";

export type CameraMode =
  | { type: "overview" }
  | { type: "closeup"; planet: string }
  | { type: "follow"; planet: string };

interface CameraRigProps {
  mode: CameraMode;
  controlsRef: React.MutableRefObject<any>;
  timeRef: React.MutableRefObject<number>;
}

const OVERVIEW_POS = new THREE.Vector3(0, 40, 70);
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0);

/** Compute desired camera pos+target for a given mode at the current time. */
function desiredFor(mode: CameraMode, time: number): { pos: THREE.Vector3; target: THREE.Vector3 } | null {
  if (mode.type === "overview") {
    return { pos: OVERVIEW_POS.clone(), target: OVERVIEW_TARGET.clone() };
  }
  const p = PLANETS.find((pl) => pl.name === mode.planet);
  if (!p) return null;
  const target = computePlanetPosition(p, time);
  // Offset scales with planet radius for a flattering close-up framing.
  const r = p.radius;
  const offsetDist = Math.max(r * 6, 3);
  const heightOffset = Math.max(r * 2.2, 1.2);
  // Position the camera "behind" the planet relative to the Sun for nice lighting.
  const dirFromSun = target.clone();
  if (dirFromSun.lengthSq() < 1e-4) dirFromSun.set(1, 0, 0);
  dirFromSun.normalize();
  const pos = target.clone().add(dirFromSun.multiplyScalar(offsetDist));
  pos.y += heightOffset;
  return { pos, target };
}

export const CameraRig = ({ mode, controlsRef, timeRef }: CameraRigProps) => {
  const { camera } = useThree();
  const tweenRef = useRef<{ start: number; duration: number; fromPos: THREE.Vector3; fromTarget: THREE.Vector3 } | null>(null);
  const modeKey = mode.type === "overview" ? "overview" : `${mode.type}:${mode.planet}`;

  // On every mode change, capture the current camera+target as the tween start.
  useEffect(() => {
    const startTarget = controlsRef.current?.target?.clone() ?? new THREE.Vector3();
    tweenRef.current = {
      start: performance.now(),
      duration: 1100,
      fromPos: camera.position.clone(),
      fromTarget: startTarget,
    };
  }, [modeKey, camera, controlsRef]);

  useFrame(() => {
    const desired = desiredFor(mode, timeRef.current);
    if (!desired || !controlsRef.current?.target) return;

    const tween = tweenRef.current;
    let k = 1;
    if (tween) {
      const t = Math.min(1, (performance.now() - tween.start) / tween.duration);
      k = 1 - Math.pow(1 - t, 3); // easeOutCubic
      if (t >= 1) tweenRef.current = null;
    }

    if (tween) {
      camera.position.lerpVectors(tween.fromPos, desired.pos, k);
      controlsRef.current.target.lerpVectors(tween.fromTarget, desired.target, k);
    } else if (mode.type === "follow") {
      // Smooth tracking after the tween settles.
      camera.position.lerp(desired.pos, 0.08);
      controlsRef.current.target.lerp(desired.target, 0.15);
    } else if (mode.type === "closeup") {
      // Keep target locked to the (slowly moving) planet, but don't drag the camera.
      controlsRef.current.target.lerp(desired.target, 0.05);
    }

    controlsRef.current.update();
  });

  return null;
};
