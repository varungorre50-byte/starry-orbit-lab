import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Sparkles, Trail } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { X, ArrowLeft } from "lucide-react";
import type { PlanetData } from "@/data/planetData";
import { VoiceAssistantButton } from "./VoiceAssistantButton";

/** Fresnel atmosphere shader — realistic limb glow */
const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * vec4(vPosition, 1.0);
  }
`;
const atmosphereFragment = `
  uniform vec3 glowColor;
  uniform float power;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fres = pow(1.0 - dot(vNormal, viewDir), power);
    gl_FragColor = vec4(glowColor * fres * intensity, fres);
  }
`;

/** Shooting star streak across the scene */
const ShootingStar = ({ delay = 0, color = "#ffffff" }: { delay?: number; color?: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  const start = useRef(performance.now() * 0.001 + delay);
  useFrame(() => {
    if (!ref.current) return;
    const now = performance.now() * 0.001;
    const cycle = 8;
    const t = ((now - start.current) % cycle) / cycle;
    if (t < 0.18) {
      const p = t / 0.18;
      ref.current.visible = true;
      ref.current.position.set(-25 + p * 50, 12 - p * 6, -15 + p * 8);
    } else {
      ref.current.visible = false;
    }
  });
  return (
    <Trail width={1.6} length={6} color={color} attenuation={(w) => w * w}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  );
};

/** Tiny moon that orbits the planet for ambience */
const Moon = ({ radius, distance, speed, color = "#cccccc", phase = 0 }: { radius: number; distance: number; speed: number; color?: string; phase?: number }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const t = performance.now() * 0.001 * speed + phase;
    ref.current.position.x = Math.cos(t) * distance;
    ref.current.position.z = Math.sin(t) * distance;
    ref.current.position.y = Math.sin(t * 0.7) * distance * 0.15;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
};

const buildPlanetSpeech = (planet: PlanetData): string => {
  const i = planet.info;
  const moonsLine = i.moonDetails
    ? ` ${planet.name} has ${i.moons} ${i.moons === 1 ? "moon" : "moons"}. ${i.moonDetails.description}`
    : ` It has ${i.moons} ${i.moons === 1 ? "moon" : "moons"}.`;
  return (
    `${planet.name}. ${i.type}. ` +
    `Diameter ${i.diameter}. Distance from the Sun ${i.distanceFromSun}. ` +
    `One day on ${planet.name} lasts ${i.dayLength}, and one year takes ${i.yearLength}. ` +
    `Surface gravity is ${i.gravity}. Temperature ranges ${i.temperature}. ` +
    `Atmosphere consists of ${i.atmosphere.join(", ")}.` +
    moonsLine
  );
};

/** Big realistic rotating planet with atmosphere, clouds (Earth), specular rim, and rings */
const BigPlanet = ({ planet }: { planet: PlanetData }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmoRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const entryProgress = useRef(0);

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, planet.textureUrl);
  } catch {
    texture = null;
  }

  const tiltRad = (planet.tilt * Math.PI) / 180;
  const displayRadius = 3.2;

  useFrame((_, delta) => {
    // Entry animation: planet zooms forward and scales up smoothly
    if (entryProgress.current < 1) {
      entryProgress.current = Math.min(1, entryProgress.current + delta * 0.9);
    }
    const t = entryProgress.current;
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);

    if (groupRef.current) {
      const scale = 0.2 + eased * 0.8;
      groupRef.current.scale.setScalar(scale);
      // come forward from far away (-z) toward camera (z=0)
      groupRef.current.position.z = -8 + eased * 8;
      // gentle floating bob once settled
      groupRef.current.position.y = Math.sin(performance.now() * 0.0006) * 0.15 * eased;
    }

    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.22;
    if (atmoRef.current) atmoRef.current.rotation.y -= delta * 0.05;
    if (ringsRef.current) ringsRef.current.rotation.z += delta * 0.02;
  });

  const atmoUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(planet.name === "Earth" ? "#6db3ff" : planet.color) },
      power: { value: planet.name === "Earth" ? 2.4 : 3.0 },
      intensity: { value: planet.name === "Earth" ? 1.6 : 1.1 },
    }),
    [planet]
  );

  const moonConfig = useMemo(() => {
    if (["Mercury", "Venus"].includes(planet.name)) return [] as { r: number; d: number; s: number; c: string; p: number }[];
    if (planet.name === "Earth") return [{ r: 0.18, d: 5.2, s: 0.5, c: "#d8d4cc", p: 0 }];
    if (planet.name === "Mars") return [
      { r: 0.08, d: 4.6, s: 0.9, c: "#a08572", p: 0 },
      { r: 0.06, d: 5.3, s: 0.6, c: "#8a7568", p: 1.2 },
    ];
    return [
      { r: 0.14, d: 5.6, s: 0.4, c: "#c9c0b3", p: 0 },
      { r: 0.10, d: 6.4, s: 0.3, c: "#b8a890", p: 2.1 },
      { r: 0.08, d: 7.1, s: 0.25, c: "#d4c8b0", p: 4.0 },
    ];
  }, [planet.name]);

  return (
    <group ref={groupRef} rotation={[tiltRad, 0, 0]}>
      {/* Fresnel atmospheric rim */}
      <mesh ref={atmoRef} scale={1.12}>
        <sphereGeometry args={[displayRadius, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={atmoUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {planet.name === "Earth" && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[displayRadius * 1.018, 96, 96]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.32} roughness={1} depthWrite={false} />
        </mesh>
      )}

      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[displayRadius, 256, 256]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={planet.name === "Earth" ? 0.65 : 0.92}
            metalness={0.04}
            emissive={planet.color}
            emissiveIntensity={0.05}
            toneMapped={true}
          />
        ) : (
          <meshStandardMaterial color={planet.color} roughness={0.7} metalness={0.1} emissive={planet.color} emissiveIntensity={0.2} />
        )}
      </mesh>

      {planet.hasRings && (
        <group ref={ringsRef as any} rotation={[Math.PI / 2.3, 0, 0]}>
          <mesh>
            <ringGeometry args={[displayRadius * 1.45, displayRadius * 1.75, 256]} />
            <meshBasicMaterial color={planet.ringColor || "#D4C494"} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[displayRadius * 1.78, displayRadius * 2.05, 256]} />
            <meshBasicMaterial color={planet.ringColor || "#E8D9A8"} transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[displayRadius * 2.08, displayRadius * 2.35, 256]} />
            <meshBasicMaterial color={planet.ringColor || "#B8A878"} transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      <Sparkles count={60} scale={displayRadius * 4} size={2} speed={0.3} color={planet.color} opacity={0.5} />

      {moonConfig.map((m, i) => (
        <Moon key={i} radius={m.r} distance={m.d} speed={m.s} color={m.c} phase={m.p} />
      ))}
    </group>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-3 py-1.5 border-b border-border/40">
    <span className="text-xs text-muted-foreground shrink-0 uppercase tracking-wider">{label}</span>
    <span className="text-sm text-foreground text-right font-medium">{value}</span>
  </div>
);

export const PlanetDetailView = ({ planet, onClose }: { planet: PlanetData; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-background animate-in fade-in duration-300">
      {/* 3D Canvas - right side (full bg on mobile) */}
      <div className="absolute inset-0 md:left-[420px]">
        <Canvas
          camera={{ position: [0, 1, 8], fov: 42 }}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          dpr={[1, 2]}
          shadows
        >
          <color attach="background" args={["#03030a"]} />
          <Stars radius={120} depth={60} count={4000} factor={4} fade speed={0.5} />

          {/* Lighting — sun-like key + soft fill + rim */}
          <ambientLight intensity={0.25} />
          <directionalLight
            position={[6, 3, 5]}
            intensity={2.2}
            color="#fff5e0"
            castShadow
          />
          <pointLight position={[-8, -2, -4]} intensity={0.6} color="#4477ff" />
          <pointLight position={[0, 5, -8]} intensity={0.4} color={planet.color} />

          <Suspense fallback={
            <Html center>
              <div className="text-muted-foreground text-sm">Loading {planet.name}…</div>
            </Html>
          }>
            <BigPlanet planet={planet} />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={5}
            maxDistance={18}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Left info sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-[420px] bg-card/95 backdrop-blur-xl border-r border-border overflow-y-auto z-10 animate-in slide-in-from-left-4 duration-500">
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border px-5 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Back to system
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-1">{planet.info.type}</div>
            <h1 className="text-4xl font-bold text-foreground">{planet.name}</h1>
          </div>

          <VoiceAssistantButton getText={() => buildPlanetSpeech(planet)} label={`Hear about ${planet.name}`} />

          <section>
            <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Overview</h2>
            <div className="space-y-0.5">
              <InfoRow label="Diameter" value={planet.info.diameter} />
              <InfoRow label="Distance from Sun" value={planet.info.distanceFromSun} />
              <InfoRow label="Day Length" value={planet.info.dayLength} />
              <InfoRow label="Year Length" value={planet.info.yearLength} />
              <InfoRow label="Temperature" value={planet.info.temperature} />
              <InfoRow label="Moons" value={String(planet.info.moons)} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">⚖ Gravity</h2>
            <div className="space-y-0.5">
              <InfoRow label="Surface Gravity" value={planet.info.gravity} />
              <InfoRow
                label="Your weight (70 kg on Earth)"
                value={`${(70 * parseFloat(planet.info.gravity) / 9.81).toFixed(1)} kg`}
              />
              <InfoRow
                label="Vs Earth"
                value={`${(parseFloat(planet.info.gravity) / 9.81 * 100).toFixed(0)}%`}
              />
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                  style={{ width: `${Math.min(parseFloat(planet.info.gravity) / 9.81 * 100, 100)}%` }}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Atmosphere</h2>
            <div className="flex flex-wrap gap-1.5">
              {planet.info.atmosphere.map((gas) => (
                <span key={gas} className="text-xs px-2.5 py-1 bg-muted rounded-md text-foreground">
                  {gas}
                </span>
              ))}
            </div>
          </section>

          {planet.info.moonDetails && (
            <section>
              <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">🌙 Moons</h2>
              {planet.info.moonDetails.largest && (
                <InfoRow label="Largest" value={planet.info.moonDetails.largest} />
              )}
              {planet.info.moonDetails.notable.length > 0 && (
                <div className="mt-2 mb-2">
                  <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Notable</div>
                  <div className="flex flex-wrap gap-1.5">
                    {planet.info.moonDetails.notable.map((m) => (
                      <span key={m} className="text-xs px-2 py-1 bg-muted rounded-md text-foreground">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                {planet.info.moonDetails.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-accent mb-2 uppercase tracking-wider">Neighbors</h2>
            <div className="space-y-0.5">
              <InfoRow label="Previous Planet" value={planet.info.distanceFromPrevious} />
              <InfoRow label="Next Planet" value={planet.info.distanceFromNext} />
            </div>
          </section>

          <p className="text-[11px] text-muted-foreground/70 text-center pt-4">
            Drag the planet to rotate • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};
