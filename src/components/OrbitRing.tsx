import * as THREE from "three";
import { useMemo } from "react";

interface OrbitRingProps {
  radius: number;
  eccentricity?: number;
  inclination?: number; // degrees
}

export const OrbitRing = ({ radius, eccentricity = 0, inclination = 0 }: OrbitRingProps) => {
  const { geometry, material } = useMemo(() => {
    const a = radius;
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    const focus = a * eccentricity;
    const incRad = (inclination * Math.PI) / 180;
    const cosI = Math.cos(incRad);
    const sinI = Math.sin(incRad);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const angle = (i / 256) * Math.PI * 2;
      const x = Math.cos(angle) * a - focus;
      const z = Math.sin(angle) * b;
      pts.push(new THREE.Vector3(x, z * sinI, z * cosI));
    }
    return {
      geometry: new THREE.BufferGeometry().setFromPoints(pts),
      material: new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.25 }),
    };
  }, [radius, eccentricity, inclination]);

  return <primitive object={new THREE.LineLoop(geometry, material)} />;
};
