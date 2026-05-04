import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Galaxy: A massive spiral disk of stars far around the solar system.
 * Becomes visible as the camera zooms out beyond the planetary orbits.
 */
export const Galaxy = ({
  radius = 1200,
  count = 30000,
  arms = 4,
}: {
  radius?: number;
  count?: number;
  arms?: number;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const inside = new THREE.Color("#ffd9a8");
    const outside = new THREE.Color("#5a78ff");
    const core = new THREE.Color("#fff2c6");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distance from galactic center, biased toward arms
      const r = Math.pow(Math.random(), 0.55) * radius;
      const branchAngle = ((i % arms) / arms) * Math.PI * 2;
      const spin = r * 0.0035; // tighter spin near edges
      const angle = branchAngle + spin;

      // Random scatter (more in the disk plane, less vertically)
      const scatter = Math.pow(Math.random(), 2.5) * (r * 0.18);
      const sx = (Math.random() - 0.5) * scatter;
      const sy = (Math.random() - 0.5) * scatter * 0.18; // thin disk
      const sz = (Math.random() - 0.5) * scatter;

      positions[i3] = Math.cos(angle) * r + sx;
      positions[i3 + 1] = sy;
      positions[i3 + 2] = Math.sin(angle) * r + sz;

      // Color: core warm, mid orange, outer blue
      const mixed = inside.clone().lerp(outside, Math.min(r / radius, 1));
      const final = r < radius * 0.08 ? core : mixed;
      colors[i3] = final.r;
      colors[i3 + 1] = final.g;
      colors[i3 + 2] = final.b;
    }

    return { positions, colors };
  }, [count, radius, arms]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.005;

      // Fade galaxy in based on camera distance from origin
      const dist = camera.position.length();
      const start = 200;
      const end = 600;
      const t = THREE.MathUtils.clamp((dist - start) / (end - start), 0, 1);
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = t * 0.95;
    }
  });

  return (
    <group rotation={[Math.PI * 0.08, 0, Math.PI * 0.05]}>
      {/* Spiral star points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.4}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Soft glowing core */}
      <mesh>
        <sphereGeometry args={[radius * 0.06, 32, 32]} />
        <meshBasicMaterial
          color="#fff1c2"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
