import { makeState } from './Observable';

// Global SFX state
const sfxVolume = makeState<number>(100);
const sfxMuted = makeState<boolean>(false);

// Semantic SFX manifest: key = semantic name, value = { path, volume }
const SFX_MANIFEST = {
    actionPrompt: { path: 'Building Interface 6-1.wav', volume: 100 },
    menuNav: { path: 'Interface 4-1.wav', volume: 80 },
    menuConfirm: { path: 'Interface 1-1.wav', volume: 80 },
    menuBack: { path: 'Interface 4-2.wav', volume: 80 },
} as const;
export type SFXKey = keyof typeof SFX_MANIFEST;

const SFX_PATH = '/audio/ui_sfx/';

// Use Partial to allow dynamic assignment, then cast when used
const sfxCache: Partial<Record<SFXKey, AudioBuffer>> = {};
let audioContext: AudioContext | null = null;

function initSFX(): Promise<void> {
    if (!audioContext) {
        const AnyWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
        audioContext = new (window.AudioContext || AnyWindow.webkitAudioContext)();
    }
    const manifestKeys = Object.keys(SFX_MANIFEST) as SFXKey[];
    if (manifestKeys.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(
        manifestKeys.map(async (key) => {
            const { path } = SFX_MANIFEST[key];
            const response = await fetch(SFX_PATH + path);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await audioContext!.decodeAudioData(arrayBuffer);
            sfxCache[key] = buffer;
        }),
    ).then(() => {});
}

function playSFX(name: SFXKey, opts?: { volume?: number }) {
    if (sfxMuted.value || !audioContext) return;
    const buffer = sfxCache[name];
    if (!buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gainNode = audioContext.createGain();
    const globalVol = sfxVolume.value;
    const perVol = opts?.volume ?? 100;
    const manifestVol = SFX_MANIFEST[name].volume;
    const finalVol = Math.round(((globalVol * perVol * manifestVol) / 1000000) * 100) / 100; // 0-1
    gainNode.gain.value = finalVol;
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
}

function setSFXVolume(vol: number) {
    sfxVolume.set(Math.max(0, Math.min(100, vol)));
}

function setSFXMute(mute: boolean) {
    sfxMuted.set(mute);
}

export function useSFX() {
    return {
        initSFX,
        playSFX,
        sfxVolume,
        setSFXVolume,
        sfxMuted,
        setSFXMute,
        SFX_MANIFEST, // export manifest for reference
    };
}
