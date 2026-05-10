import * as THREE from "three";
import type { PlanetData } from "@/data/planetData";

/** Shared orbit math used by both planets and the camera follow rig. */
export function computePlanetPosition(p: PlanetData, time: number, out?: THREE.Vector3): THREE.Vector3 {
  const v = out ?? new THREE.Vector3();
  const angle = time * p.orbitSpeed;
  const semiMajor = p.orbitRadius;
  const ecc = p.eccentricity ?? 0;
  const semiMinor = semiMajor * Math.sqrt(1 - ecc * ecc);
  const focus = semiMajor * ecc;
  const incRad = ((p.inclination ?? 0) * Math.PI) / 180;
  const x = Math.cos(angle) * semiMajor - focus;
  const z = Math.sin(angle) * semiMinor;
  v.set(x, z * Math.sin(incRad), z * Math.cos(incRad));
  return v;
}
