import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitRing } from "./OrbitRing";
import { PlanetInfoPanel } from "./PlanetInfoPanel";
import { SunInfoPanel } from "./SunInfoPanel";
import { PLANETS, SUN_DATA, type PlanetData } from "@/data/planetData";

const SolarSystem = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <Canvas
        camera={{ position: [0, 30, 50], fov: 55 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={0.08} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FDB813" distance={100} decay={0.5} />

        <Stars radius={200} depth={80} count={6000} factor={5} fade speed={1} />

        <Suspense fallback={null}>
          <Sun onClick={() => { setShowSunInfo(true); setSelectedPlanet(null); }} />

          {PLANETS.map((planet) => (
            <group key={planet.name}>
              <OrbitRing radius={planet.orbitRadius} />
              <Planet
                data={planet}
                onClick={() => { setSelectedPlanet(planet); setShowSunInfo(false); }}
              />
            </group>
          ))}
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={8}
          maxDistance={120}
          autoRotate
          autoRotateSpeed={0.15}
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.1}
        />
      </Canvas>

      {/* Title */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Solar System <span className="text-primary">Explorer</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Click on any planet or the Sun for details • Drag to orbit • Scroll to zoom</p>
      </div>

      {/* Info Panel */}
      {selectedPlanet && (
        <PlanetInfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
      {showSunInfo && (
        <SunInfoPanel onClose={() => setShowSunInfo(false)} />
      )}
    </div>
  );
};

export default SolarSystem;
