import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useState, useRef } from "react";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitRing } from "./OrbitRing";
import { PlanetDetailView } from "./PlanetDetailView";
import { SunDetailView } from "./SunDetailView";
import { SpeedController } from "./SpeedController";
import { CameraRig, type CameraPreset } from "./CameraRig";
import { CameraPresets } from "./CameraPresets";
import { PLANETS, type PlanetData } from "@/data/planetData";

const SolarSystem = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);
  const speedRef = useRef(1);
  const [speed, setSpeed] = useState(1);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("default");
  const controlsRef = useRef<any>(null);

  const handleSpeedChange = (val: number) => {
    speedRef.current = val;
    setSpeed(val);
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <Canvas
        camera={{ position: [0, 30, 50], fov: 55 }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        frameloop="always"
        performance={{ min: 0.8 }}
        onPointerMissed={() => {}}
      >
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FDB813" distance={150} decay={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={0.4} />

        <Stars radius={200} depth={80} count={6000} factor={5} fade speed={1} />

        <Suspense fallback={null}>
          <Sun
            onClick={() => { setShowSunInfo(true); setSelectedPlanet(null); }}
            showLabel={!selectedPlanet && !showSunInfo}
          />

          {PLANETS.map((planet) => (
            <group key={planet.name}>
              <OrbitRing radius={planet.orbitRadius} />
              <Planet
                data={planet}
                speedRef={speedRef}
                onClick={() => { setSelectedPlanet(planet); setShowSunInfo(false); }}
                showLabel={!selectedPlanet && !showSunInfo}
              />
            </group>
          ))}
        </Suspense>

        <CameraRig preset={cameraPreset} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={150}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>

      {/* Title */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Solar System <span className="text-primary">Explorer</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Click on any planet or the Sun for details • Drag to orbit • Scroll to zoom</p>
      </div>

      {/* Speed Controller */}
      <SpeedController speed={speed} onSpeedChange={handleSpeedChange} />

      {/* Camera Presets */}
      <CameraPresets active={cameraPreset} onChange={setCameraPreset} />

      {/* Info Panel */}
      {selectedPlanet && (
        <PlanetDetailView planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
      {showSunInfo && (
        <SunDetailView onClose={() => setShowSunInfo(false)} />
      )}
    </div>
  );
};

export default SolarSystem;
