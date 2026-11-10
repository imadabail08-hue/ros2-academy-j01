import { useEffect, useRef, useState } from "react";

export type SimState = {
  distance: number;
  setDistance: (n: number) => void;
  hz: number;
  setHz: (n: number) => void;
  paused: boolean;
  setPaused: (b: boolean) => void;
  noise: boolean;
  setNoise: (b: boolean) => void;
  raw: number;
  filtered: number;
  brake: boolean;
  tick: number;
};

function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function useSim(): SimState {
  const [distance, setDistance] = useState(2.50);
  const [hz, setHz] = useState(10);
  const [paused, setPaused] = useState(false);
  const [noise, setNoise] = useState(true);
  const [vals, setVals] = useState({ raw: 2.50, filtered: 2.50, tick: 0 });
  const win = useRef<number[]>([]);
  const dRef = useRef(distance);
  const nRef = useRef(noise);
  dRef.current = distance;
  nRef.current = noise;

  useEffect(() => {
    if (paused) return;
    const intervalMs = Math.max(20, Math.round(1000 / hz));
    const id = setInterval(() => {
      let currentRaw = dRef.current;
      if (nRef.current) {
        // Gaussian noise around ± 0.04m
        currentRaw += gauss() * 0.04;
        // 5% glitch chance
        if (Math.random() < 0.05) {
          currentRaw += Math.random() < 0.5 ? -1.80 : 2.10;
        }
      }
      currentRaw = Math.max(0.05, currentRaw);

      if (currentRaw >= 0.05 && currentRaw <= 10.0) {
        win.current.push(currentRaw);
        if (win.current.length > 5) win.current.shift();
      }
      const sorted = [...win.current].sort((a, b) => a - b);
      const filtered = sorted[Math.floor(sorted.length / 2)] ?? currentRaw;
      setVals((v) => ({ raw: currentRaw, filtered, tick: v.tick + 1 }));
    }, intervalMs);

    return () => clearInterval(id);
  }, [paused, hz]);

  return {
    distance,
    setDistance,
    hz,
    setHz,
    paused,
    setPaused,
    noise,
    setNoise,
    raw: vals.raw,
    filtered: vals.filtered,
    brake: vals.filtered < 0.50,
    tick: vals.tick,
  };
}

let audioCtx: AudioContext | null = null;
export function beep(freq = 880, dur = 0.06, vol = 0.04) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx ??= new AudioContextClass();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    // audio context might be blocked by browser policy until user gesture
  }
}
