import { makeState } from './Observable';

// Global SFX state
const sfxVolume = makeState<number>(100);
const sfxMuted = makeState<boolean>(false);

// Semantic SFX manifest
export const SFX_MANIFEST = {
    actionPrompt: { path: 'Building Interface 6-1.wav', volume: 100 },
    menuNav: { path: 'Interface 4-1.wav', volume: 80 },
    menuConfirm: { path: 'Interface 1-1.wav', volume: 80, bufferMs: 400 },
    menuBack: { path: 'Interface 4-2.wav', volume: 80, bufferMs: 250 },
} as Record<string, { path: string; volume: number; bufferMs?: number }>;

export type SFXKey = keyof typeof SFX_MANIFEST;

const SFX_PATH = '/audio/ui_sfx/';

// Internal state
const sfxCache: Partial<Record<SFXKey, AudioBuffer>> = {};
let audioContext: AudioContext | null = null;
let primed = false;

export function bufferAudioCb(key: keyof typeof SFX_MANIFEST, cb: (...args: unknown[]) => unknown) {
    playSFX(key);
    setTimeout(() => {
        cb();
    }, SFX_MANIFEST[key].bufferMs ?? 0);
}

/**
 * Ensure AudioContext exists and is running
 */
async function ensureAudioContext(): Promise<AudioContext> {
    if (!audioContext) {
        const AnyWindow = window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
        };
        audioContext = new (window.AudioContext || AnyWindow.webkitAudioContext)();
    }

    if (audioContext.state !== 'running') {
        await audioContext.resume();
    }

    return audioContext;
}

/**
 * Prime the audio graph to avoid first-play latency
 */
function primeAudioGraph(ctx: AudioContext) {
    if (primed) return;

    const buffer = Object.values(sfxCache)[0];
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime);

    primed = true;
}

/**
 * Preload and decode all SFX
 * (signature unchanged)
 */
function initSFX(): Promise<void> {
    const manifestKeys = Object.keys(SFX_MANIFEST) as SFXKey[];
    if (manifestKeys.length === 0) {
        return Promise.resolve();
    }

    return ensureAudioContext().then(async (ctx) => {
        await Promise.all(
            manifestKeys.map(async (key) => {
                const { path } = SFX_MANIFEST[key];
                const response = await fetch(SFX_PATH + path);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = await ctx.decodeAudioData(arrayBuffer);
                sfxCache[key] = buffer;
            }),
        );

        primeAudioGraph(ctx);
    });
}

/**
 * Play a semantic SFX
 * (signature unchanged)
 */
function playSFX(name: SFXKey, opts?: { volume?: number }) {
    if (sfxMuted.value) return;
    if (!audioContext || audioContext.state !== 'running') return;

    const buffer = sfxCache[name];
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();

    const globalVol = sfxVolume.value;
    const perVol = opts?.volume ?? 100;
    const manifestVol = SFX_MANIFEST[name].volume;

    gainNode.gain.value = (globalVol * perVol * manifestVol) / 1_000_000;

    source.connect(gainNode).connect(audioContext.destination);
    source.start(audioContext.currentTime);
}

/**
 * Volume & mute controls (unchanged)
 */
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
        bufferAudioCb,
        sfxVolume,
        setSFXVolume,
        sfxMuted,
        setSFXMute,
        SFX_MANIFEST,
    };
}
