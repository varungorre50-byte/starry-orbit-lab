import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Procedural ambient "planet sound" synthesizer.
 * Each planet gets a unique drone built from a base frequency + detuned oscillators
 * + a slow LFO that gives the eerie NASA-style space audio vibe.
 */
const PLANET_PROFILES: Record<
  string,
  { base: number; detune: number; lfo: number; type: OscillatorType; noise: number }
> = {
  Sun:     { base: 60,  detune: 7,  lfo: 0.18, type: "sawtooth", noise: 0.35 },
  Mercury: { base: 180, detune: 4,  lfo: 0.6,  type: "square",   noise: 0.05 },
  Venus:   { base: 90,  detune: 12, lfo: 0.25, type: "sawtooth", noise: 0.20 },
  Earth:   { base: 110, detune: 6,  lfo: 0.4,  type: "sine",     noise: 0.10 },
  Mars:    { base: 140, detune: 9,  lfo: 0.3,  type: "triangle", noise: 0.18 },
  Jupiter: { base: 50,  detune: 15, lfo: 0.15, type: "sawtooth", noise: 0.25 },
  Saturn:  { base: 70,  detune: 11, lfo: 0.2,  type: "triangle", noise: 0.22 },
  Uranus:  { base: 130, detune: 8,  lfo: 0.35, type: "sine",     noise: 0.12 },
  Neptune: { base: 80,  detune: 10, lfo: 0.28, type: "sawtooth", noise: 0.20 },
};

export const usePlanetSound = (planetName: string | null) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  const stop = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.stop();
      nodesRef.current = null;
    }
    setPlaying(false);
  }, []);

  const start = useCallback(
    (name: string) => {
      stop();
      const profile = PLANET_PROFILES[name] ?? PLANET_PROFILES.Earth;
      if (!ctxRef.current) {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const master = ctx.createGain();
      master.gain.value = 0;
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.8);
      master.connect(ctx.destination);

      // Two detuned oscillators for thick drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = profile.type;
      osc2.type = profile.type;
      osc1.frequency.value = profile.base;
      osc2.frequency.value = profile.base * 1.5;
      osc2.detune.value = profile.detune;

      // Filter for warmth
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      filter.Q.value = 4;

      // LFO modulating filter cutoff for "breathing" motion
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = profile.lfo;
      lfoGain.gain.value = 400;
      lfo.connect(lfoGain).connect(filter.frequency);

      // Noise for cosmic hiss
      const bufSize = ctx.sampleRate * 2;
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = profile.noise;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 600;
      noiseFilter.Q.value = 0.8;
      noise.connect(noiseFilter).connect(noiseGain).connect(master);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(master);

      osc1.start();
      osc2.start();
      lfo.start();
      noise.start();

      nodesRef.current = {
        stop: () => {
          try {
            master.gain.cancelScheduledValues(ctx.currentTime);
            master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
            setTimeout(() => {
              try { osc1.stop(); osc2.stop(); lfo.stop(); noise.stop(); } catch {}
              try { master.disconnect(); } catch {}
            }, 450);
          } catch {}
        },
      };
      setPlaying(true);
    },
    [volume, stop]
  );

  const toggle = useCallback(() => {
    if (!planetName) return;
    if (playing) stop();
    else start(planetName);
  }, [planetName, playing, start, stop]);

  // Stop when selection changes
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planetName]);

  useEffect(() => () => stop(), [stop]);

  return { playing, toggle, stop, volume, setVolume };
};
