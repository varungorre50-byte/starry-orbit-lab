import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Milky Way Galaxy.
 * The solar system sits at the world origin. The galaxy is offset so the
 * origin lies ~2/3 of the way out from the galactic core, inside one of the
 * spiral arms (the Orion Arm) — matching where our real Sun lives.
 */
export const Galaxy = ({
  radius = 4000,
  count = 60000,
  arms = 4,
  // Distance from galactic core to the solar system (world origin).
  sunGalacticRadius = 2600,
}: {
  radius?: number;
  count?: number;
  arms?: number;
  sunGalacticRadius?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const stars = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const inside = new THREE.Color("#ffd9a8"); // warm core
    const mid = new THREE.Color("#ffb070");
    const outside = new THREE.Color("#6a8bff"); // cool blue edge
    const core = new THREE.Color("#fff2c6");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Bias star density toward the core (Milky Way bulge)
      const r = Math.pow(Math.random(), 0.7) * radius;
      const branchAngle = ((i % arms) / arms) * Math.PI * 2;
      // Logarithmic spiral spin — tighter near the core
      const spin = r * 0.0018 + Math.log(1 + r * 0.01) * 0.6;
      const angle = branchAngle + spin;

      // Scatter perpendicular to arm; thinner disk far out
      const scatter = Math.pow(Math.random(), 2.2) * (r * 0.12);
      const sx = (Math.random() - 0.5) * scatter;
      const sz = (Math.random() - 0.5) * scatter;

      // Disk thickness: bulge near core, thin disk outside
      const bulge = Math.exp(-r / (radius * 0.12));
      const yScatter =
        (Math.random() - 0.5) * (radius * 0.005 + bulge * radius * 0.06);

      positions[i3] = Math.cos(angle) * r + sx;
      positions[i3 + 1] = yScatter;
      positions[i3 + 2] = Math.sin(angle) * r + sz;

      // Color gradient: core → mid → outer
      const t = r / radius;
      let c: THREE.Color;
      if (t < 0.08) c = core;
      else if (t < 0.45) c = inside.clone().lerp(mid, (t - 0.08) / 0.37);
      else c = mid.clone().lerp(outside, (t - 0.45) / 0.55);

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count, radius, arms]);

  // Dust lanes — darker reddish particles concentrated on arm edges
  const dust = useMemo(() => {
    const dCount = Math.floor(count * 0.4);
    const positions = new Float32Array(dCount * 3);
    const colors = new Float32Array(dCount * 3);
    const dustColor = new THREE.Color("#3a1e0e");
    for (let i = 0; i < dCount; i++) {
      const i3 = i * 3;
      const r = (0.15 + Math.random() * 0.85) * radius;
      const branchAngle = ((i % arms) / arms) * Math.PI * 2;
      const spin = r * 0.0018 + Math.log(1 + r * 0.01) * 0.6;
      const angle = branchAngle + spin + (Math.random() - 0.5) * 0.05;
      const sx = (Math.random() - 0.5) * (r * 0.04);
      const sz = (Math.random() - 0.5) * (r * 0.04);
      positions[i3] = Math.cos(angle) * r + sx;
      positions[i3 + 1] = (Math.random() - 0.5) * (radius * 0.003);
      positions[i3 + 2] = Math.sin(angle) * r + sz;
      colors[i3] = dustColor.r;
      colors[i3 + 1] = dustColor.g;
      colors[i3 + 2] = dustColor.b;
    }
    return { positions, colors };
  }, [count, radius, arms]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.003;

    // Fade galaxy in based on camera distance from origin (the Sun)
    const dist = camera.position.length();
    const start = 120;
    const end = 500;
    const t = THREE.MathUtils.clamp((dist - start) / (end - start), 0, 1);
    if (starsRef.current) {
      const m = starsRef.current.material as THREE.PointsMaterial;
      m.opacity = t * 0.95;
    }
    if (dustRef.current) {
      const m = dustRef.current.material as THREE.PointsMaterial;
      m.opacity = t * 0.6;
    }
  });

  // Offset the entire galaxy so the world origin sits on the Orion-arm position.
  // The origin should land ~sunGalacticRadius from the galactic core.
  const offset: [number, number, number] = [-sunGalacticRadius, 0, 0];

  return (
    // Tilt the galactic plane slightly relative to the ecliptic so the band
    // arches across the sky like the real Milky Way from Earth.
    <group rotation={[Math.PI * 0.18, 0, Math.PI * 0.07]}>
      <group ref={groupRef} position={offset}>
        {/* Spiral arm stars */}
        <points ref={starsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[stars.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={1.6}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Dust lanes */}
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dust.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[dust.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={2.2}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </points>

        {/* Bright central bulge (Sagittarius A* region) */}
        <mesh>
          <sphereGeometry args={[radius * 0.07, 48, 48]} />
          <meshBasicMaterial
            color="#fff1c2"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 0.14, 48, 48]} />
          <meshBasicMaterial
            color="#ffb86b"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
