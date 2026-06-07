import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useState, useRef, useCallback } from "react";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitRing } from "./OrbitRing";
import { Galaxy } from "./Galaxy";
import { SolarSystemLOD } from "./SolarSystemLOD";
import { PlanetDetailView } from "./PlanetDetailView";
import { SunDetailView } from "./SunDetailView";
import { SpeedController } from "./SpeedController";
import { CameraRig, type CameraMode } from "./CameraRig";
import { CameraPresets } from "./CameraPresets";
import { ViewAngleSelector, VIEW_ANGLES, type ViewAngle } from "./ViewAngleSelector";
import { PLANETS, type PlanetData } from "@/data/planetData";
import { PlanetSoundButton } from "./PlanetSoundButton";

/** Advances the shared simulation clock used by planets and the camera rig. */
const Ticker = ({ timeRef, speedRef }: { timeRef: React.MutableRefObject<number>; speedRef: React.MutableRefObject<number> }) => {
  useFrame((_, delta) => {
    timeRef.current += Math.min(delta, 1 / 30) * speedRef.current;
  });
  return null;
};

const SolarSystem = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showSunInfo, setShowSunInfo] = useState(false);
  const speedRef = useRef(1);
  const timeRef = useRef(0);
  const [speed, setSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState<CameraMode>({ type: "overview" });
  const [viewAngle, setViewAngle] = useState<ViewAngle>("default");
  const controlsRef = useRef<any>(null);

  const overviewPosition = (VIEW_ANGLES.find((v) => v.id === viewAngle) ?? VIEW_ANGLES[0]).position;

  const handleViewAngleChange = (v: ViewAngle) => {
    setViewAngle(v);
    setCameraMode({ type: "overview" });
  };

  const handleSpeedChange = (val: number) => {
    speedRef.current = val;
    setSpeed(val);
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <Canvas
        camera={{ position: [0, 30, 50], fov: 55, near: 0.1, far: 20000 }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        frameloop="always"
        performance={{ min: 0.8 }}
        onPointerMissed={() => {}}
      >
        <color attach="background" args={["#030308"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FDB813" distance={150} decay={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={0.4} />

        <Stars radius={600} depth={200} count={12000} factor={6} fade speed={1} />
        <Galaxy radius={4000} count={60000} arms={4} sunGalacticRadius={2600} />

        <Ticker timeRef={timeRef} speedRef={speedRef} />

        <Suspense fallback={null}>
          <SolarSystemLOD fadeStart={250} fadeEnd={650}>
            <Sun
              onClick={() => { setShowSunInfo(true); setSelectedPlanet(null); }}
              showLabel={!selectedPlanet && !showSunInfo}
            />

            {PLANETS.map((planet) => (
              <group key={planet.name}>
                <OrbitRing radius={planet.orbitRadius} eccentricity={planet.eccentricity} inclination={planet.inclination} />
                <Planet
                  data={planet}
                  timeRef={timeRef}
                  onClick={() => { setSelectedPlanet(planet); setShowSunInfo(false); }}
                  showLabel={!selectedPlanet && !showSunInfo}
                />
              </group>
            ))}
          </SolarSystemLOD>
        </Suspense>

        <CameraRig mode={cameraMode} controlsRef={controlsRef} timeRef={timeRef} overviewPosition={overviewPosition} />

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={6000}
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
      <CameraPresets mode={cameraMode} onChange={setCameraMode} />
      <ViewAngleSelector value={viewAngle} onChange={handleViewAngleChange} />

      {/* Info Panel */}
      {selectedPlanet && (
        <PlanetDetailView planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
      {showSunInfo && (
        <SunDetailView onClose={() => setShowSunInfo(false)} />
      )}

      {/* Procedural planet ambient sound — appears on the right while a planet/Sun is animating */}
      <PlanetSoundButton planetName={selectedPlanet?.name ?? (showSunInfo ? "Sun" : null)} />
    </div>
  );
};

export default SolarSystem;
