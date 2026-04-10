import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const OrbitRing = ({ radius }: { radius: number }) => {
  const ref = useRef<THREE.Line>(null);
  
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.08 });
  }, []);

  return <primitive object={new THREE.Line(geometry, material)} />;
};
