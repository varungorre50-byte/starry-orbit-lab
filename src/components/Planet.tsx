import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import type { PlanetData } from "@/data/planetData";

// Reusable Fresnel atmosphere shader (limb glow)
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmosphereFragment = /* glsl */ `
  uniform vec3 glowColor;
  uniform float power;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), power);
    gl_FragColor = vec4(glowColor * fres * intensity, fres);
  }
`;

const AtmosphereGlow = ({
  radius,
  color,
  power = 2.5,
  intensity = 1.2,
}: {
  radius: number;
  color: string;
  power?: number;
  intensity?: number;
}) => {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      power: { value: power },
      intensity: { value: intensity },
    }),
    [color, power, intensity]
  );
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// Saturn-style multi-band rings
const RingSystem = ({ inner, outer, color }: { inner: number; outer: number; color: string }) => {
  const bands = useMemo(() => {
    const arr: { i: number; o: number; opacity: number }[] = [];
    const total = 6;
    const step = (outer - inner) / total;
    for (let k = 0; k < total; k++) {
      const i = inner + step * k + (k % 2 === 0 ? 0.005 : 0.02);
      const o = i + step * 0.85;
      arr.push({ i, o, opacity: 0.25 + Math.random() * 0.45 });
    }
    return arr;
  }, [inner, outer]);
  return (
    <group rotation={[Math.PI / 2.2, 0, 0]}>
      {bands.map((b, idx) => (
        <mesh key={idx}>
          <ringGeometry args={[b.i, b.o, 128]} />
          <meshBasicMaterial color={color} transparent opacity={b.opacity} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

export const Planet = ({
  data,
  speedRef,
  onClick,
  showLabel = true,
}: {
  data: PlanetData;
  speedRef: React.MutableRefObject<number>;
  onClick: () => void;
  showLabel?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const accumulatedTime = useRef(0);

  const tiltRad = useMemo(() => (data.tilt * Math.PI) / 180, [data.tilt]);
  const inclinationRad = useMemo(() => ((data.inclination ?? 0) * Math.PI) / 180, [data.inclination]);
  const eccentricity = data.eccentricity ?? 0;
  const semiMajor = data.orbitRadius;
  const semiMinor = useMemo(
    () => semiMajor * Math.sqrt(1 - eccentricity * eccentricity),
    [semiMajor, eccentricity]
  );
  const focusOffset = semiMajor * eccentricity;

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, data.textureUrl);
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  } catch {
    texture = null;
  }

  // Per-planet visual tweaks
  const isGasGiant = ["Jupiter", "Saturn", "Uranus", "Neptune"].includes(data.name);
  const atmosphereColor =
    data.name === "Earth"
      ? "#6DB3F2"
      : data.name === "Mars"
      ? "#E0856B"
      : data.name === "Venus"
      ? "#F5D58A"
      : data.name === "Uranus"
      ? "#9EE8EA"
      : data.name === "Neptune"
      ? "#7E8CFF"
      : data.name === "Jupiter"
      ? "#E8A060"
      : data.name === "Saturn"
      ? "#F0D890"
      : null;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    accumulatedTime.current += dt * speedRef.current;
    const time = accumulatedTime.current;

    if (groupRef.current) {
      const angle = time * data.orbitSpeed;
      const x = Math.cos(angle) * semiMajor - focusOffset;
      const z = Math.sin(angle) * semiMinor;
      const cosI = Math.cos(inclinationRad);
      const sinI = Math.sin(inclinationRad);
      groupRef.current.position.x = x;
      groupRef.current.position.y = z * sinI;
      groupRef.current.position.z = z * cosI;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed * dt * 0.6;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += data.rotationSpeed * dt * 0.9;
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[tiltRad, 0, 0]}>
        {/* Planet body */}
        <mesh ref={meshRef} castShadow receiveShadow onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <sphereGeometry args={[data.radius, 128, 128]} />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              roughness={isGasGiant ? 0.85 : 0.65}
              metalness={0.05}
              emissive={data.color}
              emissiveIntensity={isGasGiant ? 0.08 : 0.12}
              toneMapped
            />
          ) : (
            <meshStandardMaterial
              color={data.color}
              roughness={0.5}
              metalness={0.1}
              emissive={data.color}
              emissiveIntensity={0.3}
            />
          )}
        </mesh>

        {/* Earth cloud layer */}
        {data.name === "Earth" && (
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[data.radius * 1.015, 64, 64]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.25}
              roughness={1}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Atmosphere fresnel glow */}
        {atmosphereColor && (
          <AtmosphereGlow
            radius={data.radius * (isGasGiant ? 1.06 : 1.08)}
            color={atmosphereColor}
            power={data.name === "Venus" ? 3.5 : 2.6}
            intensity={isGasGiant ? 1.3 : 1.0}
          />
        )}

        {/* Rings */}
        {data.hasRings && (
          <RingSystem
            inner={data.radius * 1.4}
            outer={data.radius * 2.3}
            color={data.ringColor || "#D4C494"}
          />
        )}

        {/* Subtle polar axis hint for tilted planets */}
        {Math.abs(data.tilt) > 10 && Math.abs(data.tilt) < 170 && (
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, data.radius * 2.6, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
          </mesh>
        )}
      </group>

      {showLabel && (
        <Html position={[0, data.radius + 0.8, 0]} center distanceFactor={18}>
          <div
            className="px-3 py-1.5 rounded-lg bg-card/85 text-foreground text-base font-bold whitespace-nowrap cursor-pointer backdrop-blur-sm border border-border/50"
            onClick={onClick}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
};
