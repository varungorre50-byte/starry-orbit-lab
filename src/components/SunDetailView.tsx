import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { X, ArrowLeft } from "lucide-react";
import { SUN_DATA, PLANETS } from "@/data/planetData";
import { VoiceAssistantButton } from "./VoiceAssistantButton";

const buildSunSpeech = (): string => {
  const i = SUN_DATA.info;
  return (
    `The Sun. ${i.type}. Diameter ${i.diameter}. ` +
    `Temperature ${i.temperature}. Gravity ${i.gravity}. ` +
    `Age ${i.age}. Mass ${i.mass}. Luminosity ${i.luminosity}. ` +
    `Composition: ${i.composition.join(", ")}. ` +
    `The Sun has no moons. Instead, ${PLANETS.length} planets orbit around it: ${PLANETS.map((p) => p.name).join(", ")}. ` +
    `It contains 99.86 percent of all mass in the solar system and produces energy through nuclear fusion.`
  );
};

const BigSun = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const corona1Ref = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const entryProgress = useRef(0);

  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, SUN_DATA.textureUrl);
  } catch {
    texture = null;
  }

  const displayRadius = 3.2;

  useFrame((_, delta) => {
    if (entryProgress.current < 1) {
      entryProgress.current = Math.min(1, entryProgress.current + delta * 0.9);
    }
    const t = entryProgress.current;
    const eased = 1 - Math.pow(1 - t, 3);

    if (groupRef.current) {
      const scale = 0.2 + eased * 0.8;
      groupRef.current.scale.setScalar(scale);
      groupRef.current.position.z = -8 + eased * 8;
      groupRef.current.position.y = Math.sin(performance.now() * 0.0006) * 0.15 * eased;
    }

    if (meshRef.current) meshRef.current.rotation.y += delta * 0.12;
    if (corona1Ref.current) corona1Ref.current.rotation.y -= delta * 0.05;
    if (corona2Ref.current) corona2Ref.current.rotation.y += delta * 0.03;
    if (flareRef.current) {
      const pulse = 1 + Math.sin(performance.now() * 0.001) * 0.04;
      flareRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer corona */}
      <mesh ref={flareRef}>
        <sphereGeometry args={[displayRadius * 1.5, 64, 64]} />
        <meshBasicMaterial color="#FF6A00" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <mesh ref={corona1Ref}>
        <sphereGeometry args={[displayRadius * 1.28, 64, 64]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[displayRadius * 1.12, 64, 64]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>

      {/* Sun body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[displayRadius, 128, 128]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color={SUN_DATA.color} toneMapped={false} />
        )}
      </mesh>

      {/* Powerful light from the sun */}
      <pointLight intensity={3} color="#FDB813" distance={50} decay={0.5} />
    </group>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-3 py-1.5 border-b border-border/40">
    <span className="text-xs text-muted-foreground shrink-0 uppercase tracking-wider">{label}</span>
    <span className="text-sm text-foreground text-right font-medium">{value}</span>
  </div>
);

export const SunDetailView = ({ onClose }: { onClose: () => void }) => {
  const { info } = SUN_DATA;
  return (
    <div className="fixed inset-0 z-50 bg-background animate-in fade-in duration-300">
      <div className="absolute inset-0 md:left-[420px]">
        <Canvas
          camera={{ position: [0, 1, 8], fov: 42 }}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#03030a"]} />
          <Stars radius={120} depth={60} count={4000} factor={4} fade speed={0.5} />
          <ambientLight intensity={0.4} />

          <Suspense fallback={
            <Html center>
              <div className="text-muted-foreground text-sm">Loading the Sun…</div>
            </Html>
          }>
            <BigSun />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={5}
            maxDistance={18}
          />
        </Canvas>
      </div>

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
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-1">{info.type}</div>
            <h1 className="text-4xl font-bold text-foreground">The Sun</h1>
          </div>

          <VoiceAssistantButton getText={buildSunSpeech} label="Hear about the Sun" />

          <section>
            <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Overview</h2>
            <div className="space-y-0.5">
              <InfoRow label="Diameter" value={info.diameter} />
              <InfoRow label="Temperature" value={info.temperature} />
              <InfoRow label="Gravity" value={info.gravity} />
              <InfoRow label="Age" value={info.age} />
              <InfoRow label="Mass" value={info.mass} />
              <InfoRow label="Luminosity" value={info.luminosity} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Composition</h2>
            <div className="flex flex-wrap gap-1.5">
              {info.composition.map((c) => (
                <span key={c} className="text-xs px-2.5 py-1 bg-muted rounded-md text-foreground">
                  {c}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">🌙 Moons</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Sun has no moons. As the central star, it doesn't orbit anything — instead, all 8 planets, dwarf planets, asteroids, and comets orbit around it, held by its immense gravity.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-accent mb-2 uppercase tracking-wider">🪐 Orbiting Planets ({PLANETS.length})</h2>
            <div className="flex flex-wrap gap-1.5">
              {PLANETS.map((p) => (
                <span key={p.name} className="text-xs px-2 py-1 bg-muted rounded-md text-foreground">
                  {p.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-3">
              The Sun contains 99.86% of all mass in the solar system and produces energy through nuclear fusion, converting 4 million tons of matter into energy every second.
            </p>
          </section>

          <p className="text-[11px] text-muted-foreground/70 text-center pt-4">
            Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};
